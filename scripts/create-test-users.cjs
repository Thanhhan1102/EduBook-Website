const fs = require('node:fs');
const path = require('node:path');

const projectUrl = 'https://jhhpygtddakqcdjthuxq.supabase.co';
const notePath = path.join(__dirname, '..', 'note.md');

function getSection(note, heading) {
  const section = note.split(/^## /m).find((part) => part.startsWith(heading));
  if (!section) throw new Error(`Không tìm thấy mục ${heading} trong note.md.`);
  return section;
}

function getField(section, label) {
  const line = section.split(/\r?\n/).find((item) => item.startsWith(`- ${label}: `));
  if (!line) throw new Error(`Thiếu ${label} trong note.md.`);
  return line.slice(label.length + 4).trim();
}

async function readSecret() {
  if (process.env.SUPABASE_SECRET_KEY) return process.env.SUPABASE_SECRET_KEY.trim();
  if (!process.stdin.isTTY) throw new Error('Cần chạy trong terminal để nhập Supabase secret key.');
  process.stdout.write('Supabase secret key (không hiển thị): ');
  return new Promise((resolve, reject) => {
    let value = '';
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const finish = () => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdin.off('data', onData);
      process.stdout.write('\n');
    };
    const onData = (chunk) => {
      for (const character of chunk.toString()) {
        if (character === '\u0003') { finish(); reject(new Error('Đã hủy.')); return; }
        if (character === '\r' || character === '\n') { finish(); resolve(value.trim()); return; }
        if (character === '\u007f' || character === '\b') value = value.slice(0, -1);
        else value += character;
      }
    };
    process.stdin.on('data', onData);
  });
}

async function request(secret, route, method, payload) {
  const headers = {
    apikey: secret,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
  if (secret.startsWith('eyJ')) headers.Authorization = `Bearer ${secret}`;
  const response = await fetch(`${projectUrl}${route}`, {
    method,
    headers,
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.msg || result?.message || result?.error || `HTTP ${response.status}`);
  return result;
}

function updateStatus(oldText, newText) {
  const note = fs.readFileSync(notePath, 'utf8');
  fs.writeFileSync(notePath, note.replace(oldText, newText));
}

async function main() {
  const note = fs.readFileSync(notePath, 'utf8');
  const studentSection = getSection(note, 'Tài khoản sinh viên test');
  const adminSection = getSection(note, 'Tài khoản admin');
  const accounts = [
    {
      email: getField(studentSection, 'Email'),
      password: getField(studentSection, 'Mật khẩu tạm'),
      studentId: getField(studentSection, 'Mã số sinh viên test'),
      name: 'Sinh viên Test EduBook',
      role: 'student',
      heading: 'Tài khoản sinh viên test',
      pending: 'CHƯA TẠO trong Supabase'
    },
    {
      email: getField(adminSection, 'Email'),
      password: getField(adminSection, 'Mật khẩu tạm'),
      studentId: getField(adminSection, 'Mã số test'),
      name: 'Quản trị Test EduBook',
      role: 'admin',
      heading: 'Tài khoản admin',
      pending: 'CHƯA TẠO trong Supabase; CHƯA NÂNG QUYỀN'
    }
  ];
  for (const account of accounts) {
    if (!/^edubook-(test|admin)-[a-f0-9]{8}@(example\.com|student\.iuh\.edu\.vn)$/.test(account.email)
      || account.password.length < 20) {
      throw new Error('Thông tin tài khoản tạm trong note.md không hợp lệ.');
    }
  }
  if (process.argv.includes('--dry-run')) {
    process.stdout.write('Thông tin hai tài khoản tạm hợp lệ. Chưa gửi dữ liệu tới Supabase.\n');
    return;
  }

  const secret = await readSecret();
  if (!secret.startsWith('sb_secret_') && !secret.startsWith('eyJ')) {
    throw new Error('Cần secret key/service_role key, không phải publishable key.');
  }

  for (const account of accounts) {
    const currentSection = getSection(fs.readFileSync(notePath, 'utf8'), account.heading);
    if (getField(currentSection, 'Trạng thái') !== account.pending) {
      process.stdout.write(`Bỏ qua ${account.role}: note.md đã ghi trạng thái khác.\n`);
      continue;
    }
    const user = await request(secret, '/auth/v1/admin/users', 'POST', {
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: {
        full_name: account.name,
        student_id: account.studentId,
        faculty: 'Khoa Công nghệ thông tin'
      }
    });
    const userId = user?.id || user?.user?.id;
    if (!userId) throw new Error(`Supabase không trả về ID cho tài khoản ${account.role}.`);
    if (account.role === 'admin') {
      updateStatus(account.pending, 'ĐÃ TẠO trong Supabase; CHƯA NÂNG QUYỀN');
      await request(secret, `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, 'PATCH', { role: 'admin' });
      const profiles = await request(secret, `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=role`, 'GET');
      if (!Array.isArray(profiles) || profiles.length !== 1 || profiles[0].role !== 'admin') {
        throw new Error('Đã tạo tài khoản admin nhưng chưa xác nhận được quyền admin. Kiểm tra profile trong Supabase.');
      }
      updateStatus('ĐÃ TẠO trong Supabase; CHƯA NÂNG QUYỀN', 'ĐÃ TẠO và ĐÃ NÂNG QUYỀN admin');
    } else {
      updateStatus(account.pending, 'ĐÃ TẠO trong Supabase');
    }
    process.stdout.write(`Đã tạo tài khoản ${account.role}.\n`);
  }
  process.stdout.write('Hoàn tất. Xem email và mật khẩu trong note.md trên máy của bạn.\n');
}

main().catch((error) => {
  process.stderr.write(`Không hoàn tất: ${error.message}\n`);
  process.exitCode = 1;
});
