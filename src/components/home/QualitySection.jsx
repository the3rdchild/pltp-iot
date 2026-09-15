import { qualityCards } from './homeData';
import { ArrowRightIcon } from './icons';

const QualitySection = () => (
  <section id="quality" className="quality-section">
    <div className="container">
      <div className="quality-intro-grid">
        <div>
          <h2 className="section-title">Pentingnya Memantau Kualitas Uap yang Masuk Turbin</h2>
        </div>
        <div>
          <p className="section-intro">
            Kualitas dan kemurnian uap yang masuk ke turbin memiliki peran penting dalam menjaga efisiensi serta umur peralatan pembangkit.
            Uap yang mengandung kotoran atau kadar air berlebih dapat menurunkan performa turbin, menyebabkan korosi, dan meningkatkan biaya
            perawatan. Melalui sistem pemantauan kualitas uap secara real-time, potensi gangguan tersebut dapat diminimalkan, sehingga
            kinerja pembangkit tetap optimal dan berkelanjutan.
          </p>
        </div>
      </div>

      <div className="quality-cards">
        {qualityCards.map((card) => (
          <div key={card.href} className="quality-card">
            <div className="quality-image-container">
              <img src={card.image} alt={card.alt} className="quality-image" />
            </div>
            <div className="quality-content">
              <h3 className="quality-title">{card.title}</h3>
              <p className="quality-description">{card.description}</p>
              <a href={card.href} className="btn-quality-read-more">
                Selengkapnya
                <ArrowRightIcon />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default QualitySection;
