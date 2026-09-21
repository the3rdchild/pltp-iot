import turbineDamageImg from 'assets/images/articles/tds/turbine_damage_before_after.jpg';
import pltpSystemImg from 'assets/images/articles/tds/pltp_system_diagram.png';
import silicaDepositsImg from 'assets/images/articles/tds/silica_deposits_blade.jpg';
import monitoringSystemImg from 'assets/images/articles/tds/monitoring_system_panel.jpg';

import ArticleBody from 'components/landing/article/ArticleBody';
import ArticleLayout from 'components/landing/article/ArticleLayout';
import Callout from 'components/landing/article/Callout';
import Citation from 'components/landing/article/Citation';
import Figure from 'components/landing/article/Figure';
import References from 'components/landing/article/References';
import prose from 'components/landing/article/Prose.module.css';

const sections = [
  { id: 'pendahuluan', label: 'Pendahuluan' },
  { id: 'carryover', label: 'Fenomena carryover' },
  { id: 'dampak', label: 'Mekanisme kerusakan' },
  { id: 'kasus', label: 'Pengalaman lapangan' },
  { id: 'pemantauan', label: 'Pemantauan dan pengendalian' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
  { id: 'dafpus', label: 'Daftar pustaka' }
];

const limits = [
  { parameter: 'TDS dalam uap', ideal: '< 5 ppm', accepted: '< 15 ppm' },
  { parameter: 'Kualitas uap', ideal: '≥ 99% kering', accepted: '≤ 1% moisture' },
  { parameter: 'Silika dalam uap', ideal: '< 0,02 ppm', accepted: '< 0,1 ppm' },
  { parameter: 'Natrium dalam uap', ideal: '< 2 ppb', accepted: 'Tidak ditetapkan' }
];

const references = [
  {
    author: 'Star Energy Geothermal.',
    title: 'Wayang Windu Geothermal Power Plant Operations Report',
    source: 'Technical Documentation',
    year: 2012
  },
  {
    author: 'Rizaldy, M., Zarrouk, S. J.',
    title: 'Liquid Carryover in Geothermal Steam-Water Separators',
    source: 'Proceedings of New Zealand Geothermal Workshop',
    year: 2016
  },
  { author: 'Chemaqua.', title: 'Technical Bulletin TB1-004: Boiler Water Carryover', source: 'Chemaqua Water Treatment', year: 2024 },
  {
    author: 'NCBI.',
    title:
      'Experimental Research on Water Droplet Erosion Resistance Characteristics of Turbine Blade Substrate and Strengthened Layers Materials',
    source: 'PMC',
    year: 2020
  },
  {
    author: 'IntechOpen.',
    title: 'An Overview of Droplet Impact Erosion, Related Theory and Protection Measures in Steam Turbines',
    source: 'IntechOpen',
    year: 2018
  },
  {
    author: 'IntechOpen.',
    title: 'Droplet Impact Erosion Theory and Protection Measures in Steam Turbines',
    source: 'IntechOpen',
    year: 2018
  },
  {
    author: 'ScienceDirect.',
    title: 'Last stage blades failure analysis of a 28 MW geothermal turbine',
    source: 'Engineering Failure Analysis, Vol. 16, Issue 4',
    year: 2009
  },
  {
    author: 'POWER Magazine.',
    title: 'Fighting Scale and Corrosion on Balance of Geothermal Plant Equipment',
    source: 'POWER Magazine',
    year: 2015
  },
  {
    author: 'POWER Magazine.',
    title: 'Fighting Scale and Corrosion on Balance of Geothermal Plant Equipment (bagian kedua)',
    source: 'POWER Magazine',
    year: 2015
  },
  {
    author: 'ThinkGeoEnergy.',
    title: 'Optimizing geothermal turbines: Best practices and innovations',
    source: 'ThinkGeoEnergy',
    year: 2024
  },
  { author: 'ThinkGeoEnergy.', title: 'Optimizing geothermal turbines: operational consequences', source: 'ThinkGeoEnergy', year: 2024 },
  {
    author: 'AIP Conference Proceedings.',
    title: 'The effect of the silica crust on the blades on the efficiency of the steam turbine in geothermal power plant',
    source: 'AIP Publishing, Vol. 1983',
    year: 2018
  },
  {
    author: 'Star Energy Geothermal.',
    title: 'Wayang Windu Geothermal Power Plant Operations Report (rotor replacement)',
    source: 'Technical Documentation',
    year: 2012
  },
  {
    author: 'ScienceDirect.',
    title: 'The Salak Field, Indonesia: On to the next 20 years of production',
    source: 'Geothermics, Vol. 74',
    year: 2018
  },
  { author: 'KROHNE.', title: 'Geothermal flash, binary and hybrid power generation', source: 'KROHNE Group', year: 2024 },
  {
    author: 'OSTI.',
    title: 'Continuous on-line steam quality monitoring system of the Bacman Geothermal Production Field, Philippines',
    source: 'OSTI.GOV',
    year: 1995
  },
  { author: 'Thermochem.', title: 'Advanced On-line Steam Purity Analyzer', source: 'Thermochem Technical Documentation', year: 2020 },
  { author: 'KROHNE.', title: 'Geothermal steam measurement systems', source: 'KROHNE Solutions', year: 2024 },
  { author: 'ResearchGate.', title: 'Steam Purity Considerations in Geothermal Power Generation', source: 'ResearchGate', year: 2015 },
  { author: 'ScienceDirect.', title: 'Geothermal steam-water separators: Design overview', source: 'Geothermics, Vol. 53', year: 2015 },
  { author: 'ResearchGate.', title: 'Scrubbing Lines in Geothermal Power Generation Systems', source: 'ResearchGate', year: 2010 },
  {
    author: 'ResearchGate.',
    title: 'Monitoring of geothermal steam moisture separator efficiency',
    source: 'Geothermics, Vol. 32',
    year: 2003
  }
];

// ==============================|| ARTICLE - TDS ||============================== //

export default function TDSArticle() {
  return (
    <ArticleLayout
      eyebrow="Parameter uap"
      title="Total Dissolved Solid (TDS)"
      lead="Pengaruh kandungan zat padat terlarut pada uap terhadap keandalan dan efisiensi turbin panas bumi."
    >
      <ArticleBody sections={sections}>
        <section id="pendahuluan" className={prose.prose}>
          <h2>Kerusakan turbin akibat pengotor terlarut</h2>
          <p>
            Pada 2009, inspeksi rutin di PLTP Wayang Windu, Jawa Barat, menemukan erosi pada turbin 110 MW buatan Fuji dengan tingkat
            keparahan yang mengharuskan penggantian rotor secara keseluruhan. Rotor pengganti baru terpasang pada 2012, dan selama periode
            tersebut unit tidak dapat beroperasi pada kapasitas penuh.
            <Citation num={1} />
          </p>
          <p>
            Penyebab kerusakan tersebut bukan kegagalan mekanis pada komponen turbin, melainkan kandungan mineral dan garam yang terlarut
            dalam fluida panas bumi. Kandungan tersebut dinyatakan sebagai <strong>Total Dissolved Solid (TDS)</strong>.
          </p>

          <Callout label="Definisi">
            <p>
              TDS menyatakan konsentrasi zat padat, meliputi mineral, garam, dan logam, yang terlarut dalam fluida panas bumi. Zat terlarut
              tersebut tidak teramati secara visual selama berada dalam fase cair, tetapi mengendap sebagai kristal ketika fase air menguap.
              Pada kondisi kecepatan dan temperatur tinggi di dalam turbin, endapan tersebut membentuk kerak keras pada permukaan sudu.
            </p>
          </Callout>

          <Figure
            src={turbineDamageImg}
            alt="Perbandingan sudu turbin bersih dan sudu turbin berdeposit"
            caption="Gambar 1. Perbandingan kondisi turbin tanpa deposit dan turbin dengan deposit TDS setelah periode operasi."
          />
        </section>

        <section id="carryover" className={prose.prose}>
          <h2>Fenomena carryover</h2>
          <p>
            <strong>Carryover</strong> adalah terikutnya tetesan air yang mengandung mineral terlarut ke dalam aliran uap menuju turbin.
            Separator dirancang dengan efisiensi pemisahan hingga 99,9%, namun tetesan berukuran mikroskopis tetap lolos ke sisi hilir.
            <Citation num={2} />
          </p>
          <p>
            Tetesan yang terbawa aliran menumbuk permukaan sudu turbin pada kecepatan hingga sekitar 500 km/jam. Mekanismenya setara dengan
            proses abrasi partikel, dengan tetesan bermineral berperan sebagai media abrasif yang mengikis material sudu secara bertahap.
            <Citation num={3} />
          </p>

          <Callout label="Konsekuensi" tone="warning">
            <p>
              Laju erosi tidak berbanding lurus terhadap kecepatan tumbukan. Penggandaan kecepatan tetesan meningkatkan laju erosi lebih
              dari seratus kali lipat, sehingga carryover dalam jumlah kecil sekalipun dapat menimbulkan kerusakan yang signifikan.
              <Citation num={4} />
            </p>
          </Callout>

          <Figure
            src={pltpSystemImg}
            alt="Skema sistem PLTP dengan titik pemantauan TDS"
            caption="Gambar 2. Skema sistem PLTP yang menunjukkan aliran fluida dan titik pengukuran TDS."
          />
        </section>

        <section id="dampak" className={prose.prose}>
          <h2>Tiga mekanisme kerusakan</h2>

          <h3>Erosi pada sudu turbin</h3>
          <p>
            Tetesan cairan bergerak pada kecepatan 100 hingga 600 m/s. Ketika menumbuk permukaan sudu, tumbukan tersebut menimbulkan pulsa
            tekanan yang terlokalisasi. Efek <em>water hammer</em> yang dihasilkan menimbulkan tegangan yang melampaui kekuatan luluh
            material.
            <Citation num={5} />
          </p>
          <p>
            Hubungan antara laju erosi dan kecepatan bersifat eksponensial, mengikuti hukum pangkat ER ~ V<sup>n</sup> dengan n bernilai 7
            hingga 13 bergantung pada jenis material. Penggandaan kecepatan dengan demikian meningkatkan laju erosi 128 hingga 512 kali
            lipat. Kerusakan terparah terjadi pada ujung sudu, tempat kecepatan relatif melampaui 600 m/s.
            <Citation num={6} />
          </p>
          <p>
            Observasi lapangan pada unit panas bumi berkapasitas 28 MW yang telah beroperasi selama tujuh tahun menunjukkan keretakan pada
            37 dari 62 sudu tahap akhir, dengan inisiasi retak pada <em>trailing edge</em>.
            <Citation num={7} />
          </p>

          <h3>Kerusakan lapisan pelindung</h3>
          <p>
            Sudu turbin umumnya dilapisi material pelindung berupa Stellite, kromium keras, atau lapisan nitrida. Tumbukan tetesan air
            menimbulkan kerusakan mekanis langsung, pengelupasan material lapisan, perambatan retak pada antarmuka lapisan dan substrat,
            serta delaminasi.
            <Citation num={8} />
          </p>
          <p>
            Sinergi antara oksidasi dan erosi memperparah proses tersebut. Erosi menghilangkan lapisan oksida pelindung sehingga permukaan
            logam baru terekspos dan teroksidasi dengan cepat. Lapisan oksida yang terbentuk bersifat rapuh dan rentan terhadap erosi
            berikutnya, sehingga siklus ini berulang dan mempercepat laju kehilangan material.
            <Citation num={9} />
          </p>

          <h3>Gangguan keseimbangan rotor</h3>
          <p>
            Kehilangan material tidak terjadi secara seragam pada seluruh baris sudu. Variasi distribusi kualitas uap, zona kelembapan
            tinggi setempat, dan riwayat kerusakan sebelumnya menghasilkan pola erosi yang tidak uniform.
            <Citation num={10} />
          </p>
          <p>
            Konsekuensi operasionalnya meliputi peningkatan level getaran yang memicu alarm, penurunan batas kecepatan operasi,{' '}
            <em>forced outage</em> untuk proses penyeimbangan ulang, pemendekan umur bearing, serta potensi kegagalan katastropik apabila
            kondisi tersebut tidak ditangani.
            <Citation num={11} />
          </p>

          <Figure
            src={silicaDepositsImg}
            alt="Deposit silika pada sudu turbin panas bumi"
            caption="Gambar 3. Deposit silika dan mineral terlarut pada permukaan sudu turbin."
          />
        </section>

        <section id="kasus" className={prose.prose}>
          <h2>Pengalaman lapangan panas bumi Indonesia</h2>

          <h3>PLTP Kamojang, Jawa Barat, 235 MW</h3>
          <p>
            Sebagai pembangkit panas bumi komersial pertama di Indonesia yang beroperasi sejak 1983, unit ini menghadapi permasalahan
            berulang berupa kebutuhan overhaul turbin setiap dua tahun akibat penumpukan kerak silika. Efisiensi turbin menurun dari 97,55%
            setelah overhaul menjadi 78,18%, atau kehilangan hampir 20% keluaran dalam dua tahun operasi. Pembentukan kerak SiO<sub>2</sub>,
            FeS<sub>2</sub>, dan ClO<sub>2</sub> teramati pada nozel dan sudu turbin.
            <Citation num={12} />
          </p>

          <h3>PLTP Wayang Windu, Jawa Barat, 227 MW</h3>
          <p>
            Inspeksi pada 2009 menemukan erosi pada turbin Fuji 110 MW dengan tingkat keparahan yang mengharuskan penggantian rotor secara
            keseluruhan. Rotor pengganti terpasang pada 2012, disertai kehilangan produksi selama periode <em>outage</em>.
            <Citation num={13} />
          </p>

          <h3>PLTP Salak, Jawa Barat, 377 MW</h3>
          <p>
            Lapangan panas bumi terbesar di Indonesia ini mempertahankan <em>capacity factor</em> sebesar 95% selama hampir 20 tahun melalui
            pemantauan TDS yang konsisten dan pengelolaan yang bersifat antisipatif.
            <Citation num={14} />
          </p>

          <Callout label="Perbandingan">
            <p>
              Perbedaan capaian antara PLTP Salak dan PLTP Kamojang tidak terletak pada teknologi turbin yang digunakan, melainkan pada
              intensitas pemantauan TDS dan kecepatan respons terhadap penyimpangan yang terdeteksi.
            </p>
          </Callout>
        </section>

        <section id="pemantauan" className={prose.prose}>
          <h2>Pemantauan dan pengendalian TDS</h2>
          <p>
            Pemantauan TDS memiliki tingkat kepentingan yang setara dengan pemantauan tekanan dan temperatur. Sistem yang digunakan saat ini
            mencakup beberapa teknologi berikut.
            <Citation num={15} />
          </p>

          <h3>Teknologi pemantauan daring</h3>
          <ul>
            <li>
              <strong>Flame photometry.</strong> Mengukur konsentrasi natrium sebagai indikator utama kemurnian uap, dengan sistem alarm
              bertingkat yang terintegrasi ke komputer pusat.
              <Citation num={16} />
            </li>
            <li>
              <strong>Advanced steam purity analyzer.</strong> Mengukur beberapa parameter sekaligus, meliputi natrium, silika, klorida,
              besi, kekeruhan, dan gas tidak terkondensasi, dengan batas deteksi 10 hingga 20 ppb.
              <Citation num={17} />
            </li>
            <li>
              <strong>Sistem terintegrasi SCADA.</strong> Memungkinkan pemantauan jarak jauh, penggunaan sensor nirkabel dengan umur baterai
              sepuluh tahun, serta analitik prediktif berbasis machine learning.
              <Citation num={18} />
            </li>
          </ul>

          <h3>Nilai batas kualitas uap</h3>
          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 1. Nilai batas parameter kemurnian uap pada sisi masuk turbin.</caption>
              <thead>
                <tr>
                  <th scope="col">Parameter</th>
                  <th scope="col">Nilai ideal</th>
                  <th scope="col">Batas dapat diterima</th>
                </tr>
              </thead>
              <tbody>
                {limits.map((row) => (
                  <tr key={row.parameter}>
                    <th scope="row">{row.parameter}</th>
                    <td>{row.ideal}</td>
                    <td>{row.accepted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Nilai batas pada Tabel 1 mengacu pada praktik pemantauan kemurnian uap untuk pembangkit panas bumi.
            <Citation num={19} />
          </p>

          <h3>Strategi pengendalian</h3>
          <ol>
            <li>
              <strong>Optimasi separator primer.</strong> Pengendalian level separator merupakan parameter operasional paling kritis,
              diikuti optimasi kecepatan masuk dan tekanan, serta pemantauan <em>breakdown velocity</em>.
              <Citation num={20} />
            </li>
            <li>
              <strong>Sistem scrubbing uap.</strong> <em>Drain pot</em> menghilangkan kondensat dan <em>liquid carryover</em> melalui
              pengendapan gravitasi, dengan target kualitas uap minimal 99% pada sisi masuk turbin.
              <Citation num={21} />
            </li>
            <li>
              <strong>Separator sekunder dan demister.</strong> Vessel berukuran besar dengan mesh atau pelat bergelombang bertumpuk
              berfungsi mengoalesensikan tetesan mikro, dan dikombinasikan dengan scrubbing untuk hasil optimal.
              <Citation num={22} />
            </li>
          </ol>

          <Figure
            src={monitoringSystemImg}
            alt="Panel sistem pemantauan kualitas uap"
            caption="Gambar 4. Panel sistem pemantauan kualitas uap dan TDS secara daring."
          />
        </section>

        <section id="kesimpulan" className={prose.prose}>
          <h2>Kesimpulan</h2>
          <p>
            Pengalaman operasi lapangan panas bumi di Indonesia menunjukkan bahwa pemantauan TDS yang konsisten memungkinkan operasi andal
            selama lebih dari 20 tahun dengan <em>capacity factor</em> tinggi. Faktor pembeda antara unit yang mencapai kinerja tersebut dan
            unit yang memerlukan overhaul dua tahunan terletak pada kualitas pemantauan serta kecepatan respons, bukan pada teknologi turbin
            yang digunakan.
          </p>
          <p>
            PertaSmart dikembangkan oleh PT Pertamina bersama Universitas Padjadjaran untuk memindahkan pemantauan tersebut ke jalur
            produksi, sehingga penyimpangan kualitas uap dapat terdeteksi sebelum berkembang menjadi kerusakan.
          </p>

          <Callout label="Poin utama">
            <ul>
              <li>Pemantauan TDS memiliki tingkat kepentingan yang setara dengan pemantauan tekanan dan temperatur.</li>
              <li>
                Penyimpangan yang terdeteksi lebih awal memerlukan biaya penanganan yang jauh lebih rendah dibandingkan penanganan setelah
                kerusakan terjadi.
              </li>
              <li>
                Karakteristik fluida tiap lapangan berbeda, sehingga strategi pengelolaannya tidak dapat diseragamkan. Lahendong dengan
                kandungan 150 hingga 540 mg/L memerlukan penanganan yang berbeda dari Salak maupun Kamojang.
              </li>
              <li>Sistem pemantauan daring, sensor nirkabel, dan analitik prediktif memungkinkan pengelolaan yang bersifat antisipatif.</li>
            </ul>
          </Callout>
        </section>

        <References entries={references} />
      </ArticleBody>
    </ArticleLayout>
  );
}
