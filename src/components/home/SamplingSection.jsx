import { samplingCards } from './homeData';
import { ArrowRightIcon } from './icons';

const SamplingSection = () => (
  <section id="sampling" className="sampling-section">
    <div className="container">
      <div className="sampling-intro-grid">
        <div>
          <h2 className="section-title">Teknik Pengambilan Sampel</h2>
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

      <div className="sampling-cards">
        {samplingCards.map((card) => (
          <div key={card.href} className="sampling-card">
            <div className="sampling-image-container">
              <img src={card.image} alt={card.alt} className="sampling-image" />
            </div>
            <div className="sampling-content">
              <h3 className="sampling-title">{card.title}</h3>
              <p className="sampling-description">{card.description}</p>
              <a href={card.href} className="btn-sampling-read-more">
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

export default SamplingSection;
