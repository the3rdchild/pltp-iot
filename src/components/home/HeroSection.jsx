import pertaminaLogo from '../../assets/images/pertamina1x1.svg';
import unpadLogo from '../../assets/images/logo-unpad1.png';
import heroImage from '../../assets/images/landing_page_image.jpg';

const HeroSection = () => (
  <section id="home" className="hero-section">
    <div className="container">
      <div className="brand-logos">
        <img src={pertaminaLogo} alt="Pertamina" className="brand-logo" />
        <img src={unpadLogo} alt="UNPAD" className="brand-logo" />
      </div>

      <h1 className="hero-title">
        Pengembangan Online Steam Quality - Purity
        <br />
        <span className="hero-highlight">Monitoring Smart System</span> di Lapangan
        <br />
        Geothermal
      </h1>

      <div className="hero-content-wrapper">
        <p className="hero-text">
          Pengembangan Steam Quality dan Purity Monitoring Smart System di lapangan geotermal merupakan kegiatan riset kolaboratif antara PT
          Pertamina dan Universitas Padjadjaran untuk meningkatkan keandalan operasi PLTP. Salah satu faktor penting dalam menjaga performa
          PLTP adalah memastikan kualitas dan kemurnian uap yang masuk ke turbin tetap berada dalam batas aman.
          <br />
          <br />
          Saat ini pemantauan kualitas dan kemurnian uap di PLTP masih dilakukan melalui pengambilan sampel mingguan secara manual, yang
          kemudian dianalisis di laboratorium untuk mengetahui kandungan pengotor dalam uap. Metode ini membutuhkan waktu dan tidak
          menyediakan data secara real-time, potensi adanya pengotor pada uap baru diketahui setelah hasil analisa di laboratorium yang
          membutuhkan waktu. Selain itu, Pola kemunculan pengotor tidak diketahui dengan metode sampling manual.
        </p>
        <p className="hero-text">
          Dengan menerapkan sistem pemantauan kualitas dan kemurnian uap secara langsung real-time, pola pengotor uap dapat dipantau setiap
          saat, termasuk siklus munculnya pengotor. Informasi ini memungkinkan tindakan pencegahan dini untuk melindungi peralatan turbin.
          Sistem real-time juga mengurangi biaya operasional serta mempermudah proses analisis dan pengambilan keputusan di lapangan.
          <br />
          <br />
          Sistem yang dikembangkan juga dilengkapi dengan analisis berbasis artificial intelligence (AI). Setiap parameter yang dipantau
          diproses lebih lanjut untuk mendeteksi anomali, mengidentifikasi tren, serta menghasilkan prediksi kondisi operasional. Kemampuan
          ini memungkinkan penerapan perawatan prediktif yang dapat mencegah potensi kerusakan pada sistem PLTP, sehingga risiko gangguan
          operasi dan kerugian yang lebih besar dapat dihindari.
        </p>
      </div>

      <div className="hero-image-container">
        <img src={heroImage} alt="PLTP Geothermal Facility" className="hero-image" />
      </div>
    </div>
  </section>
);

export default HeroSection;
