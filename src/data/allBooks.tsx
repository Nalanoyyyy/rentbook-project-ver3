// src/data/allBooks.ts
export interface Book {
  id: number;
  title: string;
  author: string;
  image: string;
  price: number;
  isAvailable: boolean;
  category: string; // เพิ่มหมวดหมู่เพื่อใช้ในหน้า Detail
}

export const allBooks: Book[] = [
    { id: 101, title: "The Amazing Spider-Man", author: "Stan Lee",category: "cartoon, แฟนตาซี, แอคชั่น", image: "https://picsum.photos/seed/c1/300/400", price: 50, isAvailable: true },
    { id: 102, title: "Saga", author: "Brian K. Vaughan",category: "cartoon, แฟนตาซี", image: "https://picsum.photos/seed/c2/300/400", price: 60, isAvailable: true },
    { id: 103, title: "Watchmen", author: "Alan Moore",category: "cartoon, แอคชั่น", image: "https://picsum.photos/seed/c3/300/400", price: 55, isAvailable: false },
    { id: 104, title: "Maus", author: "Art Spiegelman",category: "cartoon, แฟนตาซี", image: "https://picsum.photos/seed/c4/300/400", price: 45, isAvailable: true },
    { id: 105, title: "Persepolis", author: "Marjane Satrapi",category: "cartoon, ดราม่า", image: "https://picsum.photos/seed/c5/300/400", price: 50, isAvailable: true },
    { id: 106, title: "Bone", author: "Jeff Smith",category: "cartoon, ดราม่า", image: "https://picsum.photos/seed/c6/300/400", price: 40, isAvailable: false },
    { id: 107, title: "One Piece", author: "Eiichiro Oda",category: "cartoon, ผจญภัย, แฟนตาซี, มังงะ", image: "https://picsum.photos/seed/c7/300/400", price: 60, isAvailable: true },
    { id: 108, title: "Naruto", author: "Masashi Kishimoto",category: "cartoon, แอคชั่น, แฟนตาซี, มังงะ", image: "https://picsum.photos/seed/c8/300/400", price: 55, isAvailable: true },
    { id: 109, title: "Dragon Ball", author: "Akira Toriyama",category: "cartoon, แอคชั่น, แฟนตาซี, มังงะ", image: "https://picsum.photos/seed/c9/300/400", price: 50, isAvailable: true },
    { id: 110, title: "Attack on Titan", author: "Hajime Isayama",category: "cartoon, แอคชั่น, แฟนตาซี, มังงะ", image: "https://picsum.photos/seed/c10/300/400", price: 60, isAvailable: false },
    { id: 111, title: "My Hero Academia", author: "Kohei Horikoshi",category: "cartoon, แฟนตาซี, มังงะ", image: "https://picsum.photos/seed/c11/300/400", price: 55, isAvailable: true },
    { id: 112, title: "Fullmetal Alchemist", author: "Hiromu Arakawa",category: "cartoon, แฟนตาซี, ดราม่า", image: "https://picsum.photos/seed/c12/300/400", price: 50, isAvailable: true },
    { id: 113, title: "Death Note", author: "Tsugumi Ohba",category: "cartoon, แฟนตาซี, มังงะ", image: "https://picsum.photos/seed/c13/300/400", price: 45, isAvailable: true },
    { id: 117, title: "Black Clover", author: "Yūki Tabata",category: "cartoon, แฟนตาซี, มังงะ", image: "https://picsum.photos/seed/c17/300/400", price: 50, isAvailable: false },
    { id: 118, title: "Demon Slayer", author: "Koyoharu Gotouge",category: "cartoon, แอคชั่น, แฟนตาซี, ดราม่า, ,มังงะ", image: "https://picsum.photos/seed/c18/300/400", price: 60, isAvailable: true },
    { id: 119, title: "Jujutsu Kaisen", author: "Gege Akutami",category: "cartoon, แอคชั่น, แฟนตาซี, ดราม่า, มังงะ", image: "https://picsum.photos/seed/c19/300/400", price: 55, isAvailable: false },
    { id: 120, title: "Chainsaw Man", author: "Tatsuki Fujimoto",category: "cartoon, แฟนตาซี, มังงะ", image: "https://picsum.photos/seed/c20/300/400", price: 50, isAvailable: true },
    { id: 201, title: "The Dutch House", author: "Ann Patchett", category: "fiction, สืบสวน", image: "https://picsum.photos/seed/f1/300/400", price: 45, isAvailable: false },
    { id: 202, title: "The Guest List", author: "Lucy Foley", category: "fiction, สืบสวน", image: "https://picsum.photos/seed/f2/300/400", price: 45, isAvailable: true },
    { id: 203, title: "The Night Circus", author: "Erin Morgenstern", category: "fiction, ไซไฟ", image: "https://picsum.photos/seed/f3/300/400", price: 50, isAvailable: false },
    { id: 204, title: "Where the Crawdads Sing", author: "Delia Owens", category: "fiction, วรรณกรรมเยาวชน", image: "https://picsum.photos/seed/f4/300/400", price: 40, isAvailable: true },
    { id: 205, title: "The Giver of Stars", author: "Jojo Moyes", category: "fiction, โรแมนติก, ดราม่า", image: "https://picsum.photos/seed/f5/300/400", price: 45, isAvailable: false },
    { id: 206, title: "The Book Thief", author: "Markus Zusak", category: "fiction, แฟนตาซี", image: "https://picsum.photos/seed/f6/300/400", price: 35, isAvailable: true },
    { id: 207, title: "The Goldfinch", author: "Donna Tartt", category: "fiction, สืบสวน", image: "https://picsum.photos/seed/f7/300/400", price: 50, isAvailable: true },
    { id: 208, title: "The Shadow of the Wind", author: "Carlos Ruiz Zafón", category: "fiction, แฟนตาซี, สืบสวน", image: "https://picsum.photos/seed/f8/300/400", price: 45, isAvailable: false },
    { id: 209, title: "The Alchemist", author: "Paulo Coelho", category: "fiction, แฟนตาซี", image: "https://picsum.photos/seed/f9/300/400", price: 30, isAvailable: true },
    { id: 210, title: "The Road", author: "Cormac McCarthy", category: "fiction,สืบสวน", image: "https://picsum.photos/seed/f10/300/400", price: 40, isAvailable: false },
    { id: 211, title: "The Handmaid's Tale", author: "Margaret Atwood", category: "fiction, สืบสวน", image: "https://picsum.photos/seed/f11/300/400", price: 45, isAvailable: true },
    { id: 212, title: "The Testaments", author: "Margaret Atwood", category: "fiction, ไซไฟ", image: "https://picsum.photos/seed/f12/300/400", price: 50, isAvailable: true },
    { id: 301, title: "The Midnight Library", author: "Matt Haig", category: "general, จิตวิทยา",image: "https://picsum.photos/seed/1/300/400", price: 40, isAvailable: true },
    { id: 302, title: "Project Hail Mary", author: "Andy Weir",category: "general, จิตวิทยา", image: "https://picsum.photos/seed/2/300/400", price: 60, isAvailable: false },
    { id: 303, title: "Circe", author: "Madeline Miller", category: "general, ประวัติศาสตร์", image: "https://picsum.photos/seed/3/300/400", price: 45, isAvailable: true },
    { id: 304, title: "The Silent Patient", author: "Alex Michaelides", category: "general, ประวัติศาสตร์", image: "https://picsum.photos/seed/4/300/400", price: 50, isAvailable: true },
    { id: 305, title: "Tomorrow...", author: "Gabrielle Zevin", category: "general, ภาษา", image: "https://picsum.photos/seed/5/300/400", price: 55, isAvailable: true },
    { id: 306, title: "Lessons in Chemistry", author: "Bonnie Garmus", category: "general, ประวัติศาสตร์", image: "https://picsum.photos/seed/6/300/400", price: 45, isAvailable: false },
    { id: 307, title: "The Paris Library", author: "Janet Skeslien Charles", category: "general, ภาษา", image: "https://picsum.photos/seed/7/300/400", price: 40, isAvailable: true },
    { id: 308, title: "The Henna Artist", author: "Alka Joshi",category: "general, ธุรกิจ", image: "https://picsum.photos/seed/8/300/400", price: 35, isAvailable: false },
    { id: 309, title: "The Nightingale", author: "Kristin Hannah", category: "general, ภาษา", image: "https://picsum.photos/seed/9/300/400", price: 50, isAvailable: true },
    { id: 310, title: "The Tattooist of Auschwitz", author: "Heather Morris", category: "general, จิตวิทยา", image: "https://picsum.photos/seed/10/300/400", price: 45, isAvailable: false },
    { id: 311, title: "The Book chef", author: "Markus Zusak", category: "general, อาหาร", image: "https://picsum.photos/seed/11/300/400", price: 35, isAvailable: true },
    { id: 312, title: "The Goldfinch", author: "Donna Tartt", category: "general, ประวัติศาสตร์", image: "https://picsum.photos/seed/12/300/400", price: 50, isAvailable: false },
];

// เพิ่มใน src/data/allBooks.ts

export interface Coupon {
  id: number;
  code: string;
  title: string;
  discountValue: number; // ใช้เป็นตัวเลขเพื่อคำนวณง่ายๆ
  displayDiscount: string; // สำหรับโชว์ (เช่น 10% หรือ ฿50)
  minSpend: number;
  expiry: string;
  type: 'PERCENT' | 'FIXED';
}

export const availableCoupons: Coupon[] = [
  {
    id: 1,
    code: 'WELCOME10',
    title: 'ส่วนลดสมาชิกใหม่',
    displayDiscount: '10%',
    discountValue: 10,
    minSpend: 0,
    expiry: '31 ธ.ค. 2026',
    type: 'PERCENT'
  },
  {
    id: 2,
    code: 'READMORE50',
    title: 'ส่วนลดเช่าครบ 3 เล่ม',
    displayDiscount: '฿50',
    discountValue: 50,
    minSpend: 300,
    expiry: '30 มิ.ย. 2026',
    type: 'FIXED'
  }
];