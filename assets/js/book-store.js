(() => {
  const seedBooks = [
    { id: 'it201', title: 'Cấu Trúc Dữ Liệu & Giải Thuật', code: 'IT201', faculty: 'CNTT', author: 'TS. Nguyễn Văn Hùng · ĐH IUH', condition: 'new', price: 45000, oldPrice: 85000, rent: 25000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJNX9XEviYQNdnE1QxxnT_8ouOmox3xTBmZttx5PohaC4MWfEK4Tnsw18kaENXT-GNC-I-s0CyU3ToUHUh7T7magfMNdaU8o0_2n2H27DNVKyXOBGS9-X3LqJ41S8_rKxqotmuXfwkdIBf3xMPo7GVmU2Tugal_96p6B52sQa7xJ7qmuft3AILzbdlDWJaj3miIVJiWRxdZLsNC0qBZjgVw-6GJnEeab2LX3flO1w4KnHWYNvYyv0euA', description: 'Giáo trình hệ thống hóa các cấu trúc dữ liệu và thuật toán nền tảng, kèm ví dụ bám sát học phần IT201.' },
    { id: 'it302', title: 'Lập Trình Hướng Đối Tượng với Java', code: 'IT302', faculty: 'CNTT', author: 'TS. Lê Văn Tuấn · Bộ môn CNPM', condition: 'new', price: 48000, oldPrice: 90000, rent: 25000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8XI9PXunLMctziOpS3AjUozaUjJV6FhZQSvsTe30rg6ph3IbboNqMULzr0XLRURGqjVtfgYY3HLm7gfz0mksU_QQKk2-mHqDzEgNz0ePojOvHK0ggeat_dIZY9fqfBOa6lA2ts6pT-C6qEQIeukZ3DA4_wyamlKhwUGaaSim8lvBNa3dbT_UL3C2ziPMkVu7kYaZ7w1Iib7nxs5QU4oVW4LoRmq7eTyYccKxeDBHDI6N4XhEZWX4S8w', description: 'Tài liệu thực hành Java 17, OOP, collections và design patterns cơ bản cho sinh viên CNTT.' },
    { id: 'acc101', title: 'Nguyên Lý Kế Toán IUH', code: 'KT101', faculty: 'Kế toán', author: 'Bộ môn Kế toán Tài chính biên soạn', condition: 'pass', price: 38000, oldPrice: 75000, rent: 22000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLCnFe4AzH0Rgmrl-oEEg4So6ji3gydnNP2L07EsbrA3PLDEcNouBUO_MXqEBPffBaR-5WI62qnbOdwEGxy-em5X-od1iJ6npCagNi04F_VV7zJbZJVghevpm46HuHRCtUa_CwRuyEb2fHvIG_AJcc-SSE5Qj-gwhqLlNm4M6uHkMF2XBxxKmMEsOxTJwKxnRwjkEJkU_RzW3zJ0pEK9EUUB2fyMm8ujQhYrNeF1oEWTBtfqvkwiNzRA', description: 'Giáo trình nguyên lý kế toán theo chương trình đào tạo hiện hành, đã được kiểm tra chất lượng.' },
    { id: 'phy101', title: 'Vật Lý Đại Cương 1 & Thực Hành', code: 'VL101', faculty: 'Đại cương', author: 'PGS.TS. Trần Đình Khoa biên soạn', condition: 'new', price: 52000, oldPrice: 95000, rent: 27000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1vccs4rbES-1Zhh4cxTQAEl9Rd9KtW_j_0Pqp3mdONC1ZgII_yJTfOrJu_55iA5AwXGU_c1FSpucbTRASi1A9d6unTfOl5n2x9kj6-tfc8be29XdvQJvRPd03J3fldDL72OwlMFGWukUess-3eyoUr2KLTK5I60VVJ2Wzp6mldG1gsBntWbUFB4XMuTRvvdDIlEl5p3u0-HX-PhI75VhUAEchJxzFMx6_cXSQxYZC8beXqKlVvM1j7w', description: 'Lý thuyết và bài tập thực hành vật lý đại cương, trình bày theo cấu trúc học phần của IUH.' },
    { id: 'db201', title: 'Cơ Sở Dữ Liệu SQL Server', code: 'IT204', faculty: 'CNTT', author: 'Bộ môn Hệ thống Thông tin IUH', condition: 'new', price: 42000, oldPrice: 80000, rent: 23000, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgryvHakWbCcSbWt1xDE2IXGH-4yBnOgKXjUOq76TCwC_aX1fYVKCvq9yy4HKEcs2lhtu8mOoyDnqWW5mv2VKq26Wmg9qHw5YLoQ9E7LU9WLctx3cYvn5EaIPyejh_ApzZUNKbQ1tGZ4JNreN8L1Jb_DrbxzgUKQ3kgi6iR9Gegu9twy0EzshbvRLx-tUv3CuaZ-jJVCvcyW5om3dVEpN-z_FGjy1IQUWHh5ytWVQiAOuPV8lFqCb_Q', description: 'Tài liệu nền tảng về mô hình dữ liệu, SQL Server và các bài tập thiết kế cơ sở dữ liệu.' },
    { id: 'ee101', title: 'Kỹ Thuật Điện Tử Cơ Bản', code: 'EE101', faculty: 'Điện – Điện tử', author: 'TS. Phạm Minh Tuấn · Viện Điện', condition: 'new', price: 58000, oldPrice: 98000, rent: 29000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', description: 'Nhập môn linh kiện, mạch điện tử và kỹ thuật đo cho các học phần khối ngành điện – điện tử.' },
    { id: 'math101', title: 'Toán Cao Cấp A1', code: 'MA101', faculty: 'Đại cương', author: 'Khoa Khoa học Cơ bản IUH', condition: 'pass', price: 30000, oldPrice: 60000, rent: 18000, image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80', description: 'Tuyển tập lý thuyết, bài tập mẫu và đề ôn tập Toán cao cấp A1 cho sinh viên năm nhất.' },
    { id: 'web405', title: 'Lập Trình Web với Java & Spring', code: 'IT405', faculty: 'CNTT', author: 'ThS. Trần Minh Hoàng · CNPM IUH', condition: 'pass', price: 41000, oldPrice: 82000, rent: 28000, image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80', description: 'Giáo trình thực hành xây dựng ứng dụng web với Java, Spring Boot và cơ sở dữ liệu.' },
    { id: 'net301', title: 'Mạng Máy Tính & Internet', code: 'IT301', faculty: 'CNTT', author: 'Bộ môn Mạng máy tính IUH', condition: 'new', price: 47000, oldPrice: 88000, rent: 26000, image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', description: 'Nền tảng mạng TCP/IP, routing và các dịch vụ Internet.' },
    { id: 'os301', title: 'Hệ Điều Hành', code: 'IT303', faculty: 'CNTT', author: 'TS. Phạm Quốc Bảo', condition: 'pass', price: 39000, oldPrice: 78000, rent: 22000, image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80', description: 'Quản lý tiến trình, bộ nhớ và hệ thống tệp trong Linux.' },
    { id: 'stat101', title: 'Xác Suất Thống Kê', code: 'MA103', faculty: 'Đại cương', author: 'Khoa Khoa học Cơ bản IUH', condition: 'new', price: 36000, oldPrice: 69000, rent: 20000, image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80', description: 'Lý thuyết xác suất và bài tập thống kê ứng dụng.' },
    { id: 'mkt201', title: 'Marketing Căn Bản', code: 'MK201', faculty: 'Quản trị kinh doanh', author: 'ThS. Lương Minh Trang', condition: 'new', price: 44000, oldPrice: 82000, rent: 24000, image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80', description: 'Nhập môn marketing, hành vi khách hàng và chiến lược thị trường.' },
    { id: 'hrm301', title: 'Quản Trị Nguồn Nhân Lực', code: 'QT302', faculty: 'Quản trị kinh doanh', author: 'Bộ môn Quản trị IUH', condition: 'pass', price: 35000, oldPrice: 71000, rent: 20000, image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80', description: 'Tuyển dụng, đánh giá và phát triển nguồn nhân lực.' },
    { id: 'mech201', title: 'Cơ Học Kỹ Thuật', code: 'CK201', faculty: 'Cơ khí', author: 'TS. Võ Hữu Phước', condition: 'new', price: 54000, oldPrice: 98000, rent: 29000, image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80', description: 'Giáo trình tĩnh học, động học và sức bền vật liệu.' },
    { id: 'draw101', title: 'Vẽ Kỹ Thuật Cơ Khí', code: 'CK102', faculty: 'Cơ khí', author: 'Khoa Công nghệ Cơ khí IUH', condition: 'pass', price: 32000, oldPrice: 62000, rent: 18000, image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80', description: 'Tiêu chuẩn bản vẽ, hình chiếu và biểu diễn chi tiết máy.' },
    { id: 'chem101', title: 'Hóa Học Đại Cương', code: 'HH101', faculty: 'Hóa học', author: 'PGS.TS. Nguyễn Thanh Hà', condition: 'new', price: 43000, oldPrice: 81000, rent: 24000, image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80', description: 'Cơ sở hóa học vô cơ, hữu cơ và thí nghiệm đại cương.' },
    { id: 'garment201', title: 'Công Nghệ May Căn Bản', code: 'DM201', faculty: 'Công nghệ may', author: 'Bộ môn Công nghệ May IUH', condition: 'new', price: 46000, oldPrice: 86000, rent: 25000, image: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=800&q=80', description: 'Quy trình sản xuất, vật liệu và kỹ thuật may công nghiệp.' },
    { id: 'english201', title: 'Tiếng Anh Giao Tiếp Chuyên Ngành', code: 'TA201', faculty: 'Ngôn ngữ Anh', author: 'Trung tâm Ngoại ngữ IUH', condition: 'pass', price: 34000, oldPrice: 65000, rent: 19000, image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80', description: 'Từ vựng và tình huống giao tiếp trong môi trường học thuật.' },
    { id: 'plc301', title: 'Tự Động Hóa PLC', code: 'EE304', faculty: 'Điện – Điện tử', author: 'TS. Lê Hoàng Minh', condition: 'new', price: 59000, oldPrice: 104000, rent: 31000, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', description: 'Lập trình PLC, cảm biến và ứng dụng điều khiển công nghiệp.' }
  ];

  const sampleImages = [
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80'
  ];
  const extraSubjects = [
    ['it501', 'An Toàn Thông Tin', 'IT501', 'Khoa Công nghệ thông tin', 'Mật mã, bảo mật ứng dụng và thực hành phòng vệ hệ thống.'],
    ['it402', 'Trí Tuệ Nhân Tạo Ứng Dụng', 'IT402', 'Khoa Công nghệ thông tin', 'Các thuật toán học máy nền tảng cùng bài tập ứng dụng.'],
    ['el201', 'Mạch Điện Cơ Bản', 'EL201', 'Khoa Công nghệ Điện', 'Phân tích mạch một chiều, xoay chiều và bài tập đo lường.'],
    ['el305', 'Hệ Thống Cung Cấp Điện', 'EL305', 'Khoa Công nghệ Điện', 'Thiết kế, vận hành và bảo vệ hệ thống điện công nghiệp.'],
    ['et202', 'Vi Điều Khiển & Ứng Dụng', 'ET202', 'Khoa Công nghệ Điện tử', 'Lập trình vi điều khiển và thiết kế mạch nhúng cơ bản.'],
    ['et401', 'Xử Lý Tín Hiệu Số', 'ET401', 'Khoa Công nghệ Điện tử', 'Lấy mẫu, lọc số, biến đổi Fourier và thực hành DSP.'],
    ['dl202', 'Nguyên Lý Động Cơ Đốt Trong', 'DL202', 'Khoa Công nghệ Động lực', 'Cấu tạo, chu trình làm việc và tính toán động cơ.'],
    ['dl304', 'Kỹ Thuật Ô Tô Điện', 'DL304', 'Khoa Công nghệ Động lực', 'Hệ truyền động, pin và điều khiển trên ô tô điện.'],
    ['nl201', 'Nhiệt Động Lực Học Kỹ Thuật', 'NL201', 'Khoa Công nghệ Nhiệt - Lạnh', 'Định luật nhiệt động và các chu trình nhiệt kỹ thuật.'],
    ['nl302', 'Kỹ Thuật Điều Hòa Không Khí', 'NL302', 'Khoa Công nghệ Nhiệt - Lạnh', 'Tính tải lạnh và chọn thiết bị điều hòa không khí.'],
    ['mt202', 'Thiết Kế Trang Phục Cơ Bản', 'MT202', 'Khoa Công nghệ May - Thời trang', 'Dựng mẫu, chọn vật liệu và phát triển thiết kế trang phục.'],
    ['mt310', 'Quản Lý Sản Xuất May', 'MT310', 'Khoa Công nghệ May - Thời trang', 'Lập kế hoạch và kiểm soát chất lượng chuyền may.'],
    ['hh203', 'Hóa Hữu Cơ', 'HH203', 'Khoa Công nghệ Hóa học', 'Cấu trúc hợp chất hữu cơ và cơ chế phản ứng cơ bản.'],
    ['hh305', 'Phân Tích Hóa Học', 'HH305', 'Khoa Công nghệ Hóa học', 'Phương pháp phân tích định tính, định lượng và xử lý số liệu.'],
    ['ma202', 'Đại Số Tuyến Tính', 'MA202', 'Khoa Khoa học Cơ bản', 'Ma trận, không gian vector và ứng dụng trong kỹ thuật.'],
    ['phy202', 'Vật Lý Đại Cương 2', 'VL202', 'Khoa Khoa học Cơ bản', 'Điện từ học, quang học và bài tập thực hành.'],
    ['law101', 'Pháp Luật Đại Cương', 'LAW101', 'Khoa Luật và Khoa học chính trị', 'Khái niệm pháp luật và các tình huống áp dụng cơ bản.'],
    ['law302', 'Luật Kinh Doanh', 'LAW302', 'Khoa Luật và Khoa học chính trị', 'Khung pháp lý cho doanh nghiệp và hợp đồng thương mại.'],
    ['en202', 'Tiếng Anh Học Thuật', 'EN202', 'Khoa Ngoại ngữ', 'Kỹ năng đọc, viết và trình bày trong môi trường đại học.'],
    ['jp101', 'Tiếng Nhật Sơ Cấp 1', 'JP101', 'Khoa Ngoại ngữ', 'Từ vựng, ngữ pháp và hội thoại tiếng Nhật nhập môn.'],
    ['qt203', 'Quản Trị Học', 'QT203', 'Khoa Quản trị Kinh doanh', 'Chức năng quản trị và ra quyết định trong tổ chức.'],
    ['kt204', 'Kế Toán Tài Chính', 'KT204', 'Khoa Quản trị Kinh doanh', 'Ghi nhận nghiệp vụ và lập báo cáo tài chính cơ bản.'],
    ['dl301', 'Quản Trị Du Lịch', 'DL301', 'Khoa Thương mại - Du lịch', 'Thiết kế sản phẩm và điều hành dịch vụ du lịch.'],
    ['tm202', 'Thương Mại Điện Tử', 'TM202', 'Khoa Thương mại - Du lịch', 'Mô hình kinh doanh và vận hành kênh thương mại điện tử.'],
    ['xd201', 'Sức Bền Vật Liệu', 'XD201', 'Khoa Kỹ thuật Xây dựng', 'Ứng suất, biến dạng và kiểm tra kết cấu cơ bản.'],
    ['xd304', 'Kết Cấu Bê Tông Cốt Thép', 'XD304', 'Khoa Kỹ thuật Xây dựng', 'Nguyên lý cấu tạo và tính toán cấu kiện bê tông cốt thép.'],
    ['sk201', 'Giải Phẫu Sinh Lý Người', 'SK201', 'Khoa Khoa học Sức khỏe', 'Cấu trúc cơ thể và chức năng các hệ cơ quan.'],
    ['sk302', 'Sức Khỏe Cộng Đồng', 'SK302', 'Khoa Khoa học Sức khỏe', 'Kiến thức dự phòng và đánh giá sức khỏe cộng đồng.']
  ];
  seedBooks.push(...extraSubjects.map(([id, title, code, faculty, description], index) => {
    const price = 35000 + (index % 7) * 4000;
    return {
      id, title, code, faculty, description: `Sách mẫu phục vụ thử nghiệm catalog. ${description}`,
      author: 'Nhóm biên soạn EduBook', condition: ['new', 'over80', 'over60'][index % 3],
      availability: ['both', 'buy', 'rent'][index % 3], price, oldPrice: price * 2,
      rent: Math.round(price * 0.55 / 1000) * 1000, stock: 8 + (index % 12),
      image: sampleImages[index % sampleImages.length]
    };
  }));

  const clone = (items) => JSON.parse(JSON.stringify(items));
  const facultyMap = {
    'CNTT': 'Khoa Công nghệ thông tin',
    'Kế toán': 'Khoa Quản trị Kinh doanh',
    'Đại cương': 'Khoa Khoa học Cơ bản',
    'Điện – Điện tử': 'Khoa Công nghệ Điện tử',
    'Quản trị kinh doanh': 'Khoa Quản trị Kinh doanh',
    'Cơ khí': 'Khoa Công nghệ Động lực',
    'Hóa học': 'Khoa Công nghệ Hóa học',
    'Công nghệ may': 'Khoa Công nghệ May - Thời trang',
    'Ngôn ngữ Anh': 'Khoa Ngoại ngữ',
  };
  const normalizeBooks = (items) => items.map((book, index) => {
    const priorPass = book.condition === 'pass';
    const originalCondition = priorPass ? (index % 2 ? 'over80' : 'over60') : (['new', 'over80', 'over60'].includes(book.condition) ? book.condition : 'new');
    const stock = Number.isFinite(Number(book.stock)) ? Math.max(0, Number(book.stock)) : 6 + ((index * 7) % 19);
    const availability = ['buy', 'rent', 'both'].includes(book.availability) ? book.availability : ['both', 'buy', 'rent'][index % 3];
    const condition = availability === 'buy' ? originalCondition : 'over80';
    return { ...book, faculty: facultyMap[book.faculty] || book.faculty, condition, stock, availability };
  });
  const normalizedSeeds = normalizeBooks(clone(seedBooks));
  window.eduBookStore = { getBooks: () => clone(normalizedSeeds), seedBooks: normalizedSeeds };

})();
