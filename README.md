# Cosmic Cashflow

tilanchi.uz sayti bu saytni dizayeni har bir varagi animatsiyali boladi kursolni pastga tortsa har bir varaq kosmosdan kelib kattalashib otib ketadi saytni har bir minutda takrorlanadigan turli hil yumor memlar yoki birorta emoji ekrani u tomondan bu tomonga random otadi kursolni pastga tortsa yangiliklar birma bir otaveradi boshiga Tilanchi bu deb yumor gaplardan chiqib turadi   eng pastda esa danatxona boladi u yerda jami danat somda danat qilayotganlarga yumor gaplardan keyin danat qilayotganda animatsiyalar boladi hamda pastda danat qilgan soxta mijozlardan yumor otvizlar yangiliklar tasmasiga yangi habarlarni kiritish uchun adminga imkoniyatlar har bir yangi xabar ham animatsiyalik chad yonida rasm yoki qoyish imkoniyati adminda boladi sayt luxery vip shaklda boladi  Tilanchi.uz loyihasi uchun Luxery/VIP dizaynga ega, dynamic va yumorga boy landing page hamda Admin Panel strukturasini taqdim etaman. Sayt qora, oltinrang va to'q binafsha (deep space/VIP) ranglar uyg'unligida yaratiladi. postlarni statistikani sharxlarni faqat admin yozishi mumkin




Saytning Tashqi Ko'rinishi va Dizayni (VIP Style)

Visual Style: Deep Space (kosmos) fonida oltinrang (Gold Glow) matnlar, neon effektlar va shaffof qora (Glassmorphism) kartochkalar.

Sahifa Animatsiyasi: Scroll qilinganda har bir bo'lim (varaq) kosmos chuqurligidan katta hajmda paydo bo'lib, ekranga yaqinlashib sekin o'tib ketadi (3D Zoom & Perspective Effect).

Ekran Ustidagi Dynamic Layer: Har 1 daqiqada ekranning o'ng tarafidan chap tarafiga random ravishda kulgili memlar, e'tiborni tortuvchi emojilar yoki pop-up kartochkalar uchib o'tadi (Floating Elements).

Sahifa Bo'limlari va Funksionalligi

1. Sarlavha va Yumor Qismi (Hero Section)




Sahifa ochilganda dynamic matn o'zgarib turadi:




"Tilanchi bu — shunchaki kasb emas, bu san'at!"

"Siz bergan 1000 so'm — bizning VIP kelajagimiz."

Neon va oltin rangli yaltirash effekti bilan jihozlangan sarlavhalar.

2. Yangiliklar va Postlar Tasmasi (Dynamic Feed)




Scroll qilinganda yangiliklar va mem-xabarlar birma-bir o'tib boradi.

Har bir yangilik alohida animatsiya bilan chiqadi:




Rasm / GIF / Video qo'llab-quvvatlanadi.

Yonida Chat / Izohlar paneli mavjud.

Dynamic reaktsiyalar (like, emojilar, kulgili tugmalar).

3. Donat-Xona (Donation VIP Zone)




Statistika: Jami yig'ilgan summa real vaqt rejimida hisoblab boriladi (Masalan: 12,450,000 so'm).

Donat qilish tugmasi: Boss/VIP uslubida yaratilgan, bosilganda ekranda pullar sochilish animatsiyasi (Money Shower / Confetti) va maxsus audio effekt chaqiriladi.

Donat xabarlari: Donat jo'natilganda ekranda kulgili minnatdorchilik matni chiqadi ("Siz rasman VIP saxiysiz!").

4. Soxta va Kulgili Sharhlar (Fake Reviews Section)




Sahifa pastida "Mijozlarimizdan otzivlar" kartochkalari:




"10,000 so'm beruvdim, omadim kelib qoldi!" — Ilhomjon VIP.

"Sayt shunchalik chiroyli, hatto oxirgi pulimni ham berib yubordim." — Elon Musk (Soxta profil).

Admin Panel Imkoniyatlari

Bo'limFunksionallik va ImkoniyatlarPost YaratishYangilik yoki mem qo'shish, rasm/GIF biriktirish, post chiqish animatsiyasini tanlash.Donat BoshqaruviJami summani tahrirlash, yangi soxta sharhlar (fake reviews) qo'shish va o'chirish.Interaktiv ElementlarEkranda random uchib o'tadigan mem va emojilarni yangilash yoki chastotasini sozlash.Chat va ModeratsiyaYangiliklar yonidagi izohlarni nazorat qilish, keraksiz matnlarni o'chirish.

Texnik Tavsiyalar (Development Stack)

Frontend: React.js / Next.js (Tezkor yuklanish va SEO uchun).

3D & Animatsiyalar: Three.js / React Three Fiber (Kosmos va 3D scroll effektlari uchun), Framer Motion / GSAP (Scroll va elementlar animatsiyasi uchun).

Backend: Node.js / Express (Admin panel va dynamic yangiliklarni boshqarish uchun).

Database: MongoDB / PostgreSQL (Postlar, sharhlar va donat statistikasini saqlash uchun).  <!DOCTYPE html>
<html lang="uz" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TILANCHI.UZ — VIP Luxury Begging Experience 💎</title>

  <!-- Tailwind CSS & Canvas Confetti -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>

  <!-- Google Fonts & FontAwesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">

  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: radial-gradient(circle at center, #120b29 0%, #04010a 100%);
      color: #fff;
      overflow-x: hidden;
    }

    .font-orbitron { font-family: 'Orbitron', sans-serif; }

    /* VIP Gold Glow Effects */
    .gold-glow-text {
      color: #fbbf24;
      text-shadow: 0 0 15px rgba(251, 191, 36, 0.6), 0 0 30px rgba(245, 158, 11, 0.4);
    }
    .gold-box {
      border: 1px solid rgba(251, 191, 36, 0.3);
      box-shadow: 0 0 25px rgba(245, 158, 11, 0.15);
    }

    /* Glassmorphism Card */
    .glass-card {
      background: rgba(20, 15, 35, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(251, 191, 36, 0.25);
    }

    /* Kosmosdan kelish Scroll Animatsiyasi (Zoom Effect) */
    .zoom-section {
      opacity: 0;
      transform: scale(0.4) translateZ(-400px);
      transition: all 1.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .zoom-section.visible {
      opacity: 1;
      transform: scale(1) translateZ(0);
    }

    /* Floating Memes Animation (Ekranda uchib o'tish) */
    @keyframes floatRightToLeft {
      0% { transform: translateX(100vw) translateY(0) rotate(0deg); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateX(-30vw) translateY(-50px) rotate(360deg); opacity: 0; }
    }
    .floating-meme {
      position: fixed;
      z-index: 999;
      pointer-events: none;
      animation: floatRightToLeft 10s linear forwards;
    }
  



  

  


    


      


        👑
      


      TILANCHI.UZ
    


    


      
         Donat Qilish
      
      
         Admin Panel
      
    



  


    


      ✨ VIP Begging Club ✨
    


    
    


      TILANCHI BU —

      SHUNCHAKI KASB EMAS, SAN'AT!
    



    


      Koinotdagi eng lyuks va VIP tilanchilik platformasiga xush kelibsiz. Bizda har bir karta raqami olmos bilan qoplangan! 💎
    



    


      
        🚀 EHSON QILISH (VIP)
      
      
        📜 Mem Xabarlar
      
    




  


    


      


        🛸 KOSMIK MEM & YANGILIKLAR
      


      

Admin tomonidan real vaqtda qo'shiladigan eng so'nggi VIP habarlar


    



    
    


      
      
      


        
        


          


            🔥 RASMIY E'LON
             Bugun, 14:20
          


          

Yangi Pro Max Tilanchilik Texnologiyasi taqdim etildi


          

Endi metroda "Aka 2000 so'm berib turing" deyish shart emas! Saytimiz orqali Apple Pay bilan donat qiling.


          


            
               1,240 Laye
            
             5.4k ko'rildi
          


        


      



    




  


    


      
      
      


      



      💰 VIP EHSON ZONASI
      


        DONAT-XONA
      



      
      


        

Jami yig'ilgan soqqa (SO'MDA):


        


          12,450,000 UZS
        


      



      
      


        
          5,000 UZS
        
        
          20,000 UZS
        
        
          100,000 UZS
        
        
          1,000,000 UZS
        
      



      
      
        💸 DONAT QILISH VA BOOTSTRAP QILISH
      

      




    




  


    


      


        💬 VIP MIJOZLAR SHARHLARI
      


      

Bizga ishongan mashhur tilanchilar va donaterlar otzivlari


    



    


      
      


        


          


            👨‍💼
          


          


            

Ilhomjon VIP


            Professional Donater
          


        


        


          "Saytga tasodifan kirib qolib 10,000 so'm berib yubordim. Dizayni shunchalik lyuks-ki, endi har kuni xotimdan berkitib donat qilyapman!"
        


      



      
      


        


          


            🚀
          


          


            

Elon Musk (Soxta)


            SpaceX Assistent
          


        


        


          "Marsga uchishdan oldin oxirgi pullarimni shu saytga berib yubordim. Kosmik scroll animatsiyasiga gap yo'q!"
        


      



      
      


        


          


            👑
          


          


            

Sardor Bro


            Toshkent Sity VIP
          


        


        


          "Avvallari ko'chada yurardim, endi mana tilanchi.uz 'da soqqa qilyapman. Barchaga tavsiya qilaman!"
        


      


    




  


    

TILANCHI.UZ © 2026


    

Barcha huquqlar shaffof va oltin rangda himoyalangan. Yumor maqsadida yaratilgan. 😉




  


    


      
        
      

      


         VIP Admin Panel
      



      


        


          Post Sarlavhasi
          
        



        


          Post Matni (Yumor)
          
        



        


          Rasm URL-manzili (Unsplash yoki GIF)
          
        



        
          🚀 YANGILIKNI E'LON QILISH
        
      


    




  

Hozirgi tayyorlab berilgan front-end kodida tugmani bosgan har qanday foydalanuvchi panelni ochib post qo'shishi mumkin, chunki u joyda hali parol tekshiruvi yo'q.




Faqat admin post qo'ya oladigan qilish uchun ikkita usuldan foydalanishingiz mumkin:




1. Tezkor usul (Front-end Parol tekshiruvi)

index.html faylidagi JavaScript qismida openAdminModal() funksiyasini quyidagiga almashtirasiz. Shunda Admin Panel tugmasi bosilganda parol so'raladi:




JavaScript

// Admin parolini shu yerga o'rnatasiz
const ADMIN_PASSWORD = "vipadmin2026";

function openAdminModal() {
  const enteredPassword = prompt("🔐 Admin panelga kirish uchun parolni kiriting:");
  
  if (enteredPassword === ADMIN_PASSWORD) {
    document.getElementById('admin-modal').classList.remove('hidden');
  } else if (enteredPassword !== null) {
    alert("❌ Xato parol! Siz admin emassiz! 😈");
  }
}


2. Professional usul (Backend + Login tizimi)

Saytni to'liq tarmoqqa (Vercel, Render yoki shaxsiy serverga) joylashtirganda:




Admin uchun alohida /admin yoki /login sahifasi yaratiladi.

Admin foydalanuvchi nomi hamda paroli orqali tizimga kiradi (JWT token oladi).

Oddiy foydalanuvchilarga Admin Panel tugmasi umuman ko'rinmaydi yoki faqat o'qish (read-only) rejimida yangiliklarni ko'rish imkoniyati beriladi.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ce8e641e-6428-4728-8311-7707679aa883).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
<!-- trigger build 2026-09-19 -->
