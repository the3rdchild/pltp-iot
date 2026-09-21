import wetSteamDiagram from 'assets/images/articles/dryness-fraction/wet_steam_diagram.jpg';
import separatorSystem from 'assets/images/articles/dryness-fraction/separator_system.jpg';

import ArticleBody from 'components/landing/article/ArticleBody';
import ArticleLayout from 'components/landing/article/ArticleLayout';
import Callout from 'components/landing/article/Callout';
import Citation from 'components/landing/article/Citation';
import Figure from 'components/landing/article/Figure';
import References from 'components/landing/article/References';
import prose from 'components/landing/article/Prose.module.css';

const sections = [
  { id: 'pendahuluan', label: 'Pendahuluan' },
  { id: 'metode', label: 'Metode laboratorium' },
  { id: 'daring', label: 'Metode daring' },
  { id: 'data', label: 'Data PLTP Kamojang' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
  { id: 'dafpus', label: 'Daftar pustaka' }
];

// Separator outlet Unit 3, Januari 2022 sampai September 2023, diukur dengan
// combined separating and throttling calorimeter.
const kamojangData = [
  { date: '2022-01-05', pressure: '6,77', temperature: '167,2', quality: '99,78', ncg: '0,218', tds: '0,732' },
  { date: '2022-02-16', pressure: '6,70', temperature: '167,1', quality: '99,71', ncg: '0,260', tds: '0,772' },
  { date: '2022-03-09', pressure: '6,69', temperature: '167,0', quality: '99,79', ncg: '0,230', tds: '0,951' },
  { date: '2022-04-04', pressure: '6,68', temperature: '162,2', quality: '99,79', ncg: '0,240', tds: '0,665' },
  { date: '2022-05-11', pressure: '6,68', temperature: '166,7', quality: '99,93', ncg: '0,279', tds: '0,649' },
  { date: '2022-06-16', pressure: '6,69', temperature: '167,3', quality: '99,56', ncg: '0,275', tds: '0,651' },
  { date: '2022-07-05', pressure: '6,76', temperature: '169,2', quality: '99,94', ncg: '0,234', tds: '0,615' },
  { date: '2022-08-02', pressure: '6,75', temperature: '168,5', quality: '100,20', ncg: '0,210', tds: '0,774' },
  { date: '2022-09-14', pressure: '6,73', temperature: '168,1', quality: '99,94', ncg: '0,236', tds: '1,054' },
  { date: '2022-10-11', pressure: '6,72', temperature: '168,4', quality: '100,04', ncg: '0,220', tds: '0,574' },
  { date: '2022-11-16', pressure: '6,85', temperature: '169,4', quality: '100,04', ncg: '0,217', tds: '0,644' },
  { date: '2022-12-06', pressure: '7,15', temperature: '170,5', quality: '99,94', ncg: '0,219', tds: '0,703' },
  { date: '2023-01-05', pressure: '6,91', temperature: '168,4', quality: '100,01', ncg: '0,241', tds: '1,168' },
  { date: '2023-02-07', pressure: '6,88', temperature: '168,5', quality: '100,04', ncg: '0,233', tds: '0,960' },
  { date: '2023-03-14', pressure: '6,77', temperature: '167,9', quality: '100,02', ncg: '0,253', tds: '1,057' },
  { date: '2023-04-11', pressure: '6,84', temperature: '168,8', quality: '100,11', ncg: '0,232', tds: '2,065' },
  { date: '2023-05-16', pressure: '6,85', temperature: '168,5', quality: '100,12', ncg: '0,253', tds: '0,915' },
  { date: '2023-06-20', pressure: '6,88', temperature: '168,3', quality: '100,08', ncg: '0,277', tds: '1,391' },
  { date: '2023-08-01', pressure: '6,95', temperature: '168,9', quality: '99,97', ncg: '0,278', tds: '0,971' },
  { date: '2023-09-05', pressure: '6,99', temperature: '169,2', quality: '99,98', ncg: '0,310', tds: '1,589' }
];

const references = [
  {
    author: 'Pambudi, N. A.',
    title: 'Performance Evaluation of Double-flash Geothermal Power Plant',
    source: 'Stanford Pangea',
    year: 2013
  },
  { author: 'TLV.', title: 'The Importance of the Steam Dryness Fraction', source: 'TLV Steam Theory', year: '' },
  { author: 'Brainkart.', title: 'The Measurements of Dryness Fraction: Throttling Calorimeter', source: 'Brainkart', year: '' },
  { author: 'Engineering Notes.', title: 'How to Measure Dryness Fraction of Steam: Top 4 Methods', source: 'Engineering Notes', year: '' },
  { author: 'IASRI.', title: 'Throttling Calorimeter and Limitations', source: 'Thermodynamics and Heat Engines, IASRI', year: 2024 },
  { author: '', title: 'Determination of Dryness Fraction of Steam: Separating Calorimeter', source: 'Scribd', year: '' },
  { author: 'IASRI.', title: 'Separating Calorimeter Method and Procedure', source: 'IASRI Online Courses', year: 2024 },
  { author: 'Testbook.', title: 'Dryness Fraction of Steam: Formula, Methods, Numericals', source: 'Testbook', year: '' },
  { author: 'IASRI.', title: 'Combined Separating and Throttling Calorimeter', source: 'IASRI Research', year: 2024 },
  { author: 'Engineering Notes.', title: 'Barrel Calorimeter Method for Dryness Fraction', source: 'Engineering Notes', year: 2018 },
  { author: 'IASRI.', title: 'Bucket Calorimeter: Measurement of Dryness Fraction', source: 'IASRI', year: 2024 },
  { author: 'Endress+Hauser.', title: 'Measure and optimize utility steam consumption', source: 'Endress+Hauser', year: '' },
  { author: 'Armstrong International.', title: 'Steam Quality Monitoring: Steam QM Series', source: 'Armstrong International', year: '' }
];

// ==============================|| ARTICLE - SAMPLING DRYNESS ||============================== //

export default function SamplingDryness() {
  return (
    <ArticleLayout
      eyebrow="Metode pengukuran"
      title="Pengambilan data Dryness Fraction"
      lead="Empat metode kalorimetri laboratorium, alternatif pengukuran daring, dan hasil pengukuran di PLTP Kamojang."
    >
      <ArticleBody sections={sections}>
        <section id="pendahuluan" className={prose.prose}>
          <h2>Pendahuluan</h2>
          <p>
            Dryness fraction menyatakan rasio massa fase uap terhadap total massa campuran uap dan air. Nilai parameter ini menentukan
            efisiensi konversi energi pada turbin serta laju degradasi sudu, sehingga akurasi pengukurannya menjadi hal yang kritis.
            <Citation num={1} />
            <Citation num={2} />
          </p>
          <p>
            Uraian berikut menjelaskan empat metode kalorimetri yang digunakan di laboratorium, alternatif pengukuran secara daring, serta
            hasil pengukuran pada separator outlet PLTP Kamojang Unit 3.
          </p>

          <Figure
            src={wetSteamDiagram}
            alt="Diagram perbandingan uap basah dan uap kering"
            caption="Gambar 1. Perbedaan uap basah dan uap kering sebagai dasar penentuan dryness fraction."
          />
        </section>

        <section id="metode" className={prose.prose}>
          <h2>Empat metode pengukuran di laboratorium</h2>

          <h3>Throttling calorimeter</h3>
          <p>
            Metode ini memanfaatkan proses throttling, yaitu ekspansi isentalpik, dengan mengekspansikan uap basah melalui orifice hingga
            menjadi uap panas lanjut. Karena entalpi sebelum dan sesudah throttling bernilai sama, dryness fraction awal dapat dihitung dari
            pengukuran tekanan dan temperatur setelah throttling.
            <Citation num={3} />
          </p>
          <p>
            <strong>
              x₁ = (h<sub>g2</sub> − h<sub>f1</sub>) / h<sub>fg1</sub>
            </strong>
          </p>
          <p>
            Dengan x₁ adalah dryness fraction sebelum throttling, h<sub>f1</sub> adalah entalpi air jenuh pada P₁, h<sub>fg1</sub> adalah
            entalpi penguapan pada P₁, dan h<sub>g2</sub> adalah entalpi uap panas lanjut pada P₂ dan T₂. Prosedurnya mencakup pengambilan
            sampel uap dari pipa utama melalui perforated tube, throttling melalui katup yang sebagian tertutup, pengukuran P₂ dengan
            manometer, pengukuran T₂ dengan termometer, dan perhitungan x₁ menggunakan tabel uap.
            <Citation num={4} />
          </p>

          <Callout label="Keterbatasan" tone="warning">
            <p>
              Metode ini hanya akurat untuk x ≥ 0,93 sampai 0,95. Pada uap dengan x di bawah 0,93, hasil throttling tidak mencapai kondisi
              panas lanjut sehingga pengukuran tidak valid. Untuk kondisi tersebut digunakan combined separating and throttling calorimeter.
              <Citation num={5} />
            </p>
          </Callout>

          <h3>Separating calorimeter</h3>
          <p>
            Metode ini memisahkan air dari uap secara mekanis menggunakan gaya sentrifugal dan baffle plate. Air yang terpisah dikumpulkan
            dan ditimbang, sedangkan uap kering yang keluar dikondensasikan dan ditimbang pula.
            <Citation num={6} />
          </p>
          <p>
            <strong>
              x = m<sub>s</sub> / (m<sub>s</sub> + m<sub>w</sub>)
            </strong>
          </p>
          <p>
            Dengan m<sub>s</sub> adalah massa uap terkondensasi dan m<sub>w</sub> adalah massa air yang terpisah, keduanya dalam kg per
            menit.
            <Citation num={7} />
          </p>
          <p>
            Keterbatasannya terletak pada pemisahan yang tidak pernah sepenuhnya sempurna, karena sebagian tetesan mikro tetap terbawa
            bersama uap keluar. Hasilnya cenderung lebih tinggi dari nilai sebenarnya, dengan akurasi ±2 sampai 3%.
          </p>

          <h3>Combined separating and throttling calorimeter</h3>
          <p>
            Metode ini menggabungkan kedua pendekatan sebelumnya. Tahap pertama menaikkan dryness fraction dari x₁ menjadi x₂ dengan
            membuang sebagian air, kemudian tahap kedua mengukur x₂ yang telah lebih kering dan menghitung kembali nilai x₁. Rentang ukurnya
            mencapai x = 0,70.
            <Citation num={8} />
          </p>
          <p>
            <strong>
              x₁ = x₂ × [(m<sub>s</sub> + m<sub>w</sub>) / m<sub>s</sub>]
            </strong>
          </p>
          <p>
            Prosedurnya mencakup pengukuran massa air yang terpisah pada tahap separating, pengukuran P₃ dan T₃ setelah throttling,
            perhitungan x₂ dari tabel uap, pengukuran massa uap terkondensasi, dan perhitungan x₁. Metode ini merupakan metode paling akurat
            dengan ketelitian ±1 sampai 2%, dan menjadi metode acuan untuk PLTP karena mampu menangani uap dengan kadar air tinggi.
            <Citation num={9} />
          </p>

          <h3>Barrel calorimeter</h3>
          <p>
            Metode ini berbasis kesetimbangan kalor. Sampel uap basah dikondensasikan dalam air dingin di dalam bejana tembaga terisolasi,
            kemudian kenaikan temperatur air diukur untuk menghitung perpindahan kalor dan menentukan dryness fraction.
            <Citation num={10} />
          </p>
          <p>
            <strong>
              x = [(m<sub>air</sub> C<sub>pw</sub> + m<sub>bejana</sub> C<sub>bejana</sub>) ΔT − m<sub>uap</sub> C<sub>ps</sub> (T
              <sub>sat</sub> − T₂)] / (m<sub>uap</sub> h<sub>fg</sub>)
            </strong>
          </p>
          <p>
            Nilai kapasitas kalor jenis yang digunakan adalah 4,18 kJ/kg·K untuk air, 2,1 kJ/kg·K untuk uap, dan 0,39 kJ/kg·K untuk tembaga.
            Metode ini bersifat pendekatan karena kehilangan kalor ke lingkungan sulit dihilangkan sepenuhnya meskipun bejana terisolasi.
            Hasilnya cenderung lebih rendah dari nilai sebenarnya dengan akurasi ±5 sampai 8%, sehingga sesuai untuk pemeriksaan cepat
            tetapi tidak untuk pengukuran presisi.
            <Citation num={11} />
          </p>

          <Figure
            src={separatorSystem}
            alt="Sistem separator dan demister"
            caption="Gambar 2. Sistem separator dan demister sebagai acuan pengambilan sampel uap."
          />
        </section>

        <section id="daring" className={prose.prose}>
          <h2>Metode pengukuran daring</h2>
          <p>Untuk pemantauan kontinu di lapangan, tersedia beberapa teknologi pengukuran tanpa penghentian operasi.</p>
          <ol>
            <li>
              <strong>Vortex flowmeter dengan kompensasi densitas.</strong> Pengukuran berlangsung waktu nyata berdasarkan selisih densitas,
              dengan kompensasi inline menggunakan sensor tekanan dan temperatur serta tabel uap IAPWS-IF97. Akurasinya ±2 sampai 3% untuk x
              di atas 0,90.
              <Citation num={12} />
            </li>
            <li>
              <strong>Steam quality monitor.</strong> Sistem pemantauan daring otomatis yang mengukur dan merekam tren dryness fraction
              secara kontinu, dilengkapi sistem peringatan ketika nilai berada di bawah ambang.
              <Citation num={13} />
            </li>
            <li>
              <strong>Metode optik berbasis spektroskopi absorpsi laser.</strong> Menggunakan dua panjang gelombang untuk membedakan uap air
              dan fase cair. Metode ini bersifat non-invasif dan sensitif, tetapi biaya serta kompleksitas penerapannya di lapangan masih
              tinggi.
            </li>
          </ol>
        </section>

        <section id="data" className={prose.prose}>
          <h2>Data pengukuran PLTP Kamojang</h2>
          <p>
            Tabel berikut memuat hasil pengukuran kualitas uap dan parameter terkait di PLTP Kamojang untuk periode Januari 2022 sampai
            September 2023. Data diambil dari separator outlet Unit 3 menggunakan metode combined separating and throttling calorimeter yang
            dikalibrasi terhadap pressure transmitter dan sensor RTD.
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>
                Tabel 1. Hasil pengukuran kualitas uap pada separator outlet PLTP Kamojang Unit 3.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Tanggal</th>
                  <th scope="col">P (bar)</th>
                  <th scope="col">T (°C)</th>
                  <th scope="col">Kualitas uap (%)</th>
                  <th scope="col">NCG (%)</th>
                  <th scope="col">TDS (ppm)</th>
                </tr>
              </thead>
              <tbody>
                {kamojangData.map((row) => (
                  <tr key={row.date}>
                    <th scope="row">{row.date}</th>
                    <td>{row.pressure}</td>
                    <td>{row.temperature}</td>
                    <td>{row.quality}</td>
                    <td>{row.ncg}</td>
                    <td>{row.tds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Analisis hasil pengukuran</h3>
          <p>
            <strong>Kualitas uap.</strong> Nilai minimum tercatat 99,56% pada Juni 2022 dan nilai maksimum 100,20% pada Agustus 2022, dengan
            rata-rata 99,98%. Nilai di atas 100% menunjukkan kondisi panas lanjut ringan. Seluruh pengukuran berada di atas nilai
            rekomendasi 95%.
          </p>
          <p>
            <strong>Tekanan dan temperatur.</strong> Tekanan berada pada rentang 6,68 sampai 7,15 bar dan temperatur pada 162,2 sampai 170,5
            °C, konsisten dengan kondisi uap jenuh pada tekanan tersebut. Kenaikan ringan pada kuartal keempat 2022 dapat berkaitan dengan
            pengaruh musiman atau optimasi produksi.
          </p>
          <p>
            <strong>Non condensable gas.</strong> Nilai berada pada rentang 0,210 sampai 0,310% dengan kecenderungan naik dari 0,218% pada
            Januari 2022 menjadi 0,310% pada September 2023. Tren ini perlu dipantau karena kandungan NCG di atas 0,5% berpengaruh
            signifikan terhadap kinerja turbin.
          </p>
          <p>
            <strong>Total dissolved solid.</strong> Nilai berada pada rentang 0,574 sampai 2,065 ppm, jauh di bawah batas 5 ppm. Lonjakan
            hingga 2,065 ppm pada April 2023 mengindikasikan kemungkinan terjadinya carryover dan memerlukan penelusuran lebih lanjut.
          </p>

          <Callout label="Penilaian">
            <ul>
              <li>Kualitas uap konsisten di atas 99,5% sepanjang 21 bulan, menunjukkan kinerja separator dan demister yang baik.</li>
              <li>Variabilitas rendah dengan simpangan baku sekitar 0,15%, menandakan operasi yang stabil.</li>
              <li>TDS terkendali di bawah 2,1 ppm sehingga risiko scaling dan fouling minimal.</li>
              <li>Kandungan NCG berada pada tingkat yang dapat diterima, menandakan sistem gas removal bekerja memadai.</li>
            </ul>
          </Callout>
        </section>

        <section id="kesimpulan" className={prose.prose}>
          <h2>Kesimpulan</h2>
          <p>
            Pemilihan metode pengukuran dryness fraction bergantung pada rentang nilai yang diharapkan dan tingkat ketelitian yang
            dibutuhkan. Throttling calorimeter memadai untuk uap yang relatif kering, separating calorimeter memberikan hasil yang cenderung
            lebih tinggi dari nilai sebenarnya, barrel calorimeter sesuai untuk pemeriksaan cepat, sedangkan combined separating and
            throttling calorimeter merupakan metode acuan dengan rentang ukur dan ketelitian terbaik.
          </p>
          <p>
            Hasil pengukuran di PLTP Kamojang Unit 3 selama 21 bulan menunjukkan kualitas uap yang konsisten berada pada rentang optimal.
            Pemantauan daring melengkapi pengukuran berkala tersebut dengan menyediakan data pada rentang waktu di antara dua pengambilan
            sampel.
          </p>
        </section>

        <References entries={references} />
      </ArticleBody>
    </ArticleLayout>
  );
}
