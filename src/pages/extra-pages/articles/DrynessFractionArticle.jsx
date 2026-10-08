import wetSteamDiagram from 'assets/images/articles/dryness-fraction/wet_steam_diagram.jpg';
import turbineErosionBlade from 'assets/images/articles/dryness-fraction/turbine_erosion_blade.jpg';
import separatorSystem from 'assets/images/articles/dryness-fraction/separator_system.jpg';
import drynessEfficiencyGraph from 'assets/images/articles/dryness-fraction/dryness_efficiency_graph.jpg';

import ArticleBody from 'components/landing/article/ArticleBody';
import ArticleLayout from 'components/landing/article/ArticleLayout';
import Callout from 'components/landing/article/Callout';
import Citation from 'components/landing/article/Citation';
import Figure from 'components/landing/article/Figure';
import References from 'components/landing/article/References';
import prose from 'components/landing/article/Prose.module.css';

const sections = [
  { id: 'pendahuluan', label: 'Pendahuluan' },
  { id: 'definisi', label: 'Definisi dan perumusan' },
  { id: 'dampak', label: 'Mekanisme penurunan kinerja' },
  { id: 'standar', label: 'Nilai acuan operasi' },
  { id: 'studi', label: 'Studi lapangan' },
  { id: 'pemantauan', label: 'Pemantauan dan pengendalian' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
  { id: 'dafpus', label: 'Daftar pustaka' }
];

const targets = [
  { level: 'Batas minimum', value: 'x ≥ 0,90', note: 'Di bawah nilai ini risiko kerusakan turbin meningkat tajam.' },
  { level: 'Direkomendasikan', value: 'x ≥ 0,95', note: 'Operasi efisien dengan laju keausan turbin minimal.' },
  { level: 'Optimal', value: 'x ≥ 0,98', note: 'Efisiensi maksimum dan umur pakai turbin terpanjang.' }
];

const references = [
  {
    author: 'Pambudi, N. A.',
    title: 'Performance Evaluation of Double-flash Geothermal Power Plant',
    source: 'Stanford Pangea',
    year: 2013
  },
  { author: '', title: 'An Update Dieng: Energy and Exergy Analysis', source: 'Politeknik Negeri Jember', year: 2024 },
  { author: 'TLV.', title: 'The Importance of the Steam Dryness Fraction', source: 'TLV Steam Theory', year: '' },
  { author: 'Thermopedia.', title: 'Geothermal Heat Utilization Methods', source: 'Thermopedia', year: '' },
  { author: '', title: 'Optimizing Efficiency and Performance in Rankine Cycle', source: 'Techscience', year: 2024 },
  { author: 'Liu University.', title: 'Wet Steam and Condensation Loss Analysis', source: 'Energy Procedia', year: 2013 },
  { author: 'Soni, S.', title: 'Analysis of Liquid Droplet Erosion for Steam Turbine', source: 'IJMERR', year: 2012 },
  { author: 'Kashyap, T.', title: 'Silt erosion and cavitation impact on hydraulic turbines', source: 'ScienceDirect', year: 2024 },
  { author: 'Walker, D.', title: 'Wet Steam Measurement Techniques', source: 'Nottingham Repository', year: '' },
  {
    author: 'Ramadhan, D. F. dkk.',
    title: 'Evaluation Turbine Blade Design and Materials Steam Turbine',
    source: 'JREM ITENAS',
    year: 2025
  },
  { author: 'Wen, C.', title: 'Wet steam flow and condensation loss in turbine blade cascade', source: 'ScienceDirect', year: 2021 },
  { author: 'TLV.', title: 'Wet Steam Corrosion', source: 'TLV Steam Theory', year: '' },
  {
    author: 'POWER Magazine.',
    title: 'Fighting Scale and Corrosion on Balance of Geothermal Plant Equipment',
    source: 'POWER Magazine',
    year: 2015
  },
  { author: 'Han dkk.', title: 'Dehumidification optimization of steam turbines', source: 'ScienceDirect', year: 2023 },
  { author: '', title: 'International Journal of Renewable Energy Development', source: 'Ejournal Undip', year: 2016 },
  { author: '', title: 'Mutnovsky Geothermal Plant study', source: 'ScienceDirect', year: 2018 },
  {
    author: 'Rizaldy, M., Zarrouk, S. J.',
    title: 'Liquid Carryover in Geothermal Steam-Water Separators',
    source: 'Proceedings of New Zealand Geothermal Workshop',
    year: 2016
  },
  {
    author: 'ResearchGate.',
    title: 'Monitoring of geothermal steam moisture separator efficiency',
    source: 'Geothermics, Vol. 32',
    year: 2003
  },
  { author: 'OSTI.', title: 'Steam Quality Monitoring Systems for Geothermal Applications', source: 'OSTI.GOV', year: 1995 },
  { author: 'Moya, D.', title: 'Geothermal energy technology review', source: 'Renewable and Sustainable Energy Reviews', year: 2018 }
];

// ==============================|| ARTICLE - DRYNESS FRACTION ||============================== //

export default function DrynessFractionArticle() {
  return (
    <ArticleLayout
      eyebrow="Parameter uap"
      title="Dryness Fraction"
      lead="Pengaruh proporsi fase uap terhadap efisiensi konversi energi dan laju degradasi sudu turbin."
    >
      <ArticleBody sections={sections}>
        <section id="pendahuluan" className={prose.prose}>
          <h2>Pengaruh kandungan air terhadap kinerja turbin</h2>
          <p>
            Evaluasi performa di PLTU Mamuju setelah overhaul turbin menunjukkan penurunan efisiensi dari 91,16% menjadi 86,7%. Analisis
            mengaitkan penurunan tersebut dengan turunnya dryness fraction dari 1,02 menjadi 0,99. Selisih yang kecil pada parameter ini
            berdampak besar pada keluaran unit.
            <Citation num={1} />
          </p>
          <p>
            Pola serupa teramati di PLTP Kamojang. Turbin memerlukan overhaul setiap dua tahun akibat akumulasi kerak dan erosi yang
            berkaitan dengan uap basah, dengan efisiensi menurun dari 97,55% menjadi 78,18% dalam periode tersebut.
            <Citation num={2} />
          </p>

          <Callout label="Definisi">
            <p>
              Dryness fraction adalah rasio massa fase uap terhadap total massa campuran uap dan air. Nilai 1,0 menyatakan uap tanpa fase
              cair, sedangkan nilai 0,9 menyatakan bahwa 10% dari massa campuran berupa air cair. Pada PLTP, selisih 1% pada dryness
              fraction berkorelasi dengan penurunan efisiensi turbin sekitar 1%.
            </p>
          </Callout>

          <Figure
            src={wetSteamDiagram}
            alt="Diagram perbandingan uap basah dan uap kering"
            caption="Gambar 1. Perbedaan uap basah dengan dryness fraction rendah dan uap kering dengan dryness fraction tinggi."
          />
        </section>

        <section id="definisi" className={prose.prose}>
          <h2>Definisi dan perumusan</h2>
          <p>
            Dryness fraction didefinisikan sebagai rasio massa uap kering terhadap total massa campuran dua fase, dan dirumuskan sebagai
            berikut.
            <Citation num={3} />
          </p>
          <p>
            <strong>
              x = m<sub>uap</sub> / (m<sub>uap</sub> + m<sub>cair</sub>)
            </strong>
          </p>
          <p>
            Dengan x adalah dryness fraction bernilai 0 hingga 1, m<sub>uap</sub> adalah massa uap kering, dan m<sub>cair</sub> adalah massa
            air cair dalam campuran. Rentang nilainya dibaca sebagai berikut.
          </p>
          <ul>
            <li>x = 0 menyatakan seluruh massa berupa air cair pada kondisi jenuh.</li>
            <li>0 &lt; x &lt; 1 menyatakan campuran dua fase atau uap basah.</li>
            <li>x = 1 menyatakan uap jenuh kering.</li>
            <li>
              x &gt; 1 digunakan secara konvensional untuk menyatakan kondisi uap panas lanjut, yaitu ketika temperatur melampaui temperatur
              jenuh pada tekanan tersebut.
              <Citation num={4} />
            </li>
          </ul>
        </section>

        <section id="dampak" className={prose.prose}>
          <h2>Tiga mekanisme penurunan kinerja</h2>

          <h3>Penurunan efisiensi menurut kaidah Baumann</h3>
          <p>
            Kaidah Baumann menyatakan bahwa setiap kenaikan 1% kadar air, atau penurunan 1% dryness fraction, menurunkan efisiensi turbin
            sekitar 1%. Penurunan tersebut berasal dari tiga sebab.
            <Citation num={5} />
          </p>
          <ul>
            <li>
              <strong>Energi yang terpakai untuk mengangkut fase cair.</strong> Tetesan air tidak memberikan kontribusi terhadap kerja
              turbin, tetapi tetap menyerap energi kinetik aliran uap.
            </li>
            <li>
              <strong>Penurunan luas aliran efektif.</strong> Keberadaan fase cair mengurangi luas penampang aliran uap, sehingga ekspansi
              dan kerja yang dihasilkan menurun.
            </li>
            <li>
              <strong>Rugi akibat percikan.</strong> Tetesan yang terlempar dari permukaan sudu menimbulkan turbulensi dan rugi tambahan.
              <Citation num={6} />
            </li>
          </ul>
          <p>
            Sebagai ilustrasi, turbin yang beroperasi pada dryness fraction 0,90 mengalami penurunan efisiensi sekitar 10% dibandingkan
            operasi dengan uap kering. Pada unit berkapasitas 110 MW, selisih tersebut setara dengan kehilangan keluaran sekitar 11 MW.
          </p>

          <h3>Erosi sudu akibat tumbukan tetesan air</h3>
          <p>
            Tetesan air dalam uap basah bergerak pada kecepatan 100 hingga 600 m/s dan menumbuk sudu turbin dengan tekanan impak yang
            tinggi. Fenomena <em>water droplet erosion</em> ini menimbulkan tiga bentuk kerusakan.
            <Citation num={7} />
          </p>
          <ul>
            <li>
              <strong>Pitting dan erosi permukaan.</strong> Tumbukan berulang membentuk lubang kecil yang secara progresif melebar dan
              memperdalam, sehingga profil aerodinamis sudu berubah.
              <Citation num={8} />
            </li>
            <li>
              <strong>Inisiasi retak.</strong> Konsentrasi tegangan di sekitar lubang menjadi titik awal retak yang dapat merambat hingga
              kegagalan sudu.
              <Citation num={9} />
            </li>
            <li>
              <strong>Kegagalan lapisan pelindung.</strong> Lapisan Stellite atau chrome plating mengalami delaminasi akibat tumbukan
              tetesan, sehingga material dasar yang lebih rentan menjadi terekspos.
              <Citation num={10} />
            </li>
          </ul>
          <p>
            Laju erosi meningkat secara eksponensial ketika dryness fraction berada di bawah 0,90. Penurunan dari x = 0,95 menjadi x = 0,85
            dilaporkan meningkatkan laju erosi hingga sepuluh kali lipat.
            <Citation num={11} />
          </p>

          <h3>Akselerasi korosi</h3>
          <p>
            Uap basah menimbulkan kerusakan mekanis sekaligus kimiawi. Fase cair yang terbawa mengandung mineral terlarut dan gas korosif
            yang mempercepat laju korosi melalui beberapa jalur.
            <Citation num={12} />
          </p>
          <ul>
            <li>Lapisan air pada permukaan sudu membentuk lingkungan elektrolit yang mendukung korosi galvanik.</li>
            <li>Oksigen terlarut mempercepat oksidasi permukaan logam.</li>
            <li>
              Gas asam berupa CO<sub>2</sub> dan H<sub>2</sub>S menurunkan pH sehingga laju korosi meningkat.
            </li>
            <li>Siklus basah dan kering yang berulang mempercepat pertumbuhan lapisan oksida beserta pengelupasannya.</li>
          </ul>
          <p>
            Sinergi antara erosi dan korosi merupakan kombinasi yang paling merusak. Erosi menghilangkan lapisan oksida pelindung sehingga
            logam baru terekspos dan teroksidasi dengan cepat, sementara lapisan oksida yang terbentuk bersifat rapuh dan mudah tererosi.
            <Citation num={13} />
          </p>

          <Figure
            src={turbineErosionBlade}
            alt="Erosi dan korosi pada sudu turbin akibat uap basah"
            caption="Gambar 2. Erosi dan korosi pada sudu turbin yang dioperasikan dengan uap basah."
          />
        </section>

        <section id="standar" className={prose.prose}>
          <h2>Nilai acuan operasi</h2>
          <p>
            Berdasarkan pengalaman operasi PLTP dan rekomendasi pabrikan turbin, nilai dryness fraction yang perlu dipertahankan adalah
            sebagai berikut.
            <Citation num={14} />
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 1. Nilai acuan dryness fraction pada sisi masuk turbin.</caption>
              <thead>
                <tr>
                  <th scope="col">Tingkat</th>
                  <th scope="col">Nilai</th>
                  <th scope="col">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((row) => (
                  <tr key={row.level}>
                    <th scope="row">{row.level}</th>
                    <td>{row.value}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout label="Catatan">
            <p>
              Pada PLTP flash, nilai x = 1,0 sulit dicapai karena proses pemisahan uap dan air tidak pernah sepenuhnya efektif. Target yang
              realistis adalah x = 0,96 hingga 0,99 dengan separator dan demister yang terpelihara.
              <Citation num={15} />
            </p>
          </Callout>
        </section>

        <section id="studi" className={prose.prose}>
          <h2>Studi lapangan</h2>

          <h3>PLTP Dieng, Jawa Tengah</h3>
          <p>
            Analisis energi dan eksergi menunjukkan bahwa setelah pemisahan di separator, dryness fraction mencapai 0,96 hingga 0,99.
            Analisis yang sama menemukan bahwa turbin yang beroperasi pada x &lt; 0,90 mengalami penurunan efisiensi signifikan disertai
            kenaikan biaya pemeliharaan hingga tiga kali lipat dibandingkan operasi pada x ≥ 0,95.
            <Citation num={2} />
          </p>

          <h3>PLTU Mamuju, Sulawesi Barat</h3>
          <p>
            Studi performa setelah overhaul menunjukkan hubungan langsung antara dryness fraction dan efisiensi, yaitu penurunan dari x =
            1,02 menjadi x = 0,99 yang disertai penurunan efisiensi turbin dari 91,16% menjadi 86,7%. Hasil ini konsisten dengan kaidah
            Baumann.
            <Citation num={1} />
          </p>

          <h3>PLTP Mutnovsky, Rusia</h3>
          <p>
            Penerapan superheater untuk menaikkan dryness fraction hingga 0,98 sampai 1,0 meningkatkan efisiensi siklus dan memperpanjang
            interval overhaul turbin hingga dua kali lipat. Investasi superheater dilaporkan kembali dalam tiga hingga empat tahun melalui
            penghematan pemeliharaan dan kenaikan keluaran.
            <Citation num={16} />
          </p>

          <Callout label="Perbandingan">
            <p>
              Selisih antara unit yang beroperasi pada x = 0,90 dan x = 0,98 tidak terbatas pada efisiensi, tetapi juga mencakup biaya
              siklus hidup secara keseluruhan. Investasi pada sistem pemisahan berkualitas terbukti menguntungkan dalam jangka panjang.
            </p>
          </Callout>

          <Figure
            src={separatorSystem}
            alt="Sistem separator dan demister"
            caption="Gambar 3. Sistem separator dan demister untuk pemisahan fase cair dari aliran uap."
          />
        </section>

        <section id="pemantauan" className={prose.prose}>
          <h2>Pemantauan dan pengendalian</h2>
          <p>
            Mempertahankan dryness fraction pada nilai optimal memerlukan kombinasi desain sistem pemisahan, pemantauan berkelanjutan, dan
            pengendalian operasional.
          </p>

          <h3>Teknologi pemisahan</h3>
          <ol>
            <li>
              <strong>Separator primer bertipe siklon.</strong> Memanfaatkan gaya sentrifugal untuk memisahkan tetesan air dari uap, dengan
              efisiensi pemisahan 95% hingga 98% untuk tetesan berdiameter di atas 50 μm. Pengendalian level separator bersifat kritis
              karena level yang terlalu tinggi menyebabkan carryover, sedangkan level yang terlalu rendah menurunkan efisiensi pemisahan.
              <Citation num={17} />
            </li>
            <li>
              <strong>Demister bertipe mesh atau vane.</strong> Berfungsi sebagai tahap kedua untuk menangkap tetesan berdiameter 5 hingga
              50 μm yang lolos dari separator, dan menaikkan dryness fraction dari sekitar 0,95 menjadi 0,98 hingga 0,99. Pemeliharaan rutin
              diperlukan untuk mencegah fouling dan penyumbatan.
              <Citation num={18} />
            </li>
            <li>
              <strong>Superheater.</strong> Memanaskan uap jenuh hingga kondisi panas lanjut sehingga risiko kondensasi pada pipa dan turbin
              hilang. Opsi ini memerlukan investasi kapital yang signifikan dan umumnya layak untuk unit berkapasitas di atas 100 MW.
              <Citation num={16} />
            </li>
          </ol>

          <h3>Metode pengukuran</h3>
          <p>
            <strong>Metode langsung.</strong> Steam quality analyzer mengukur dryness fraction melalui pengambilan sampel uap, kondensasi,
            dan penimbangan massa. Metode ini akurat tetapi memerlukan penghentian operasi secara periodik.
            <Citation num={19} />
          </p>
          <p>
            <strong>Metode tidak langsung.</strong> Nilai dihitung dari pengukuran entalpi, tekanan, dan temperatur menggunakan tabel uap.
            Pemantauan daring dengan sensor laju alir, tekanan, dan temperatur memungkinkan estimasi dryness fraction secara waktu nyata.
            <Citation num={20} />
          </p>

          <Callout label="Penerapan pada PertaSmart">
            <ul>
              <li>Sensor tekanan, temperatur, dan laju alir terintegrasi dengan algoritma estimasi dryness fraction secara kontinu.</li>
              <li>
                Peringatan otomatis ketika nilai mendekati batas minimum operasi, sehingga tindakan preventif dapat dilakukan lebih awal.
              </li>
              <li>Analitik prediktif untuk memperkirakan degradasi separator dan menyusun jadwal pemeliharaan.</li>
            </ul>
          </Callout>

          <Figure
            src={drynessEfficiencyGraph}
            alt="Grafik hubungan dryness fraction dengan efisiensi turbin"
            caption="Gambar 4. Hubungan dryness fraction terhadap efisiensi dan laju keausan turbin."
          />
        </section>

        <section id="kesimpulan" className={prose.prose}>
          <h2>Kesimpulan</h2>
          <p>
            Dryness fraction merupakan salah satu parameter operasional paling kritis pada PLTP. Mempertahankan nilainya di atas 0,95
            berpengaruh tidak hanya terhadap efisiensi, tetapi juga terhadap umur pakai turbin, biaya pemeliharaan, dan keandalan jangka
            panjang.
          </p>
          <p>
            Pengalaman operasi di lapangan panas bumi Indonesia maupun internasional menunjukkan bahwa investasi pada sistem pemisahan,
            pemantauan berkelanjutan, dan pengendalian operasional memberikan hasil berupa efisiensi turbin yang konsisten, penurunan biaya
            pemeliharaan, perpanjangan interval overhaul, serta peningkatan ketersediaan unit.
          </p>

          <Callout label="Poin utama">
            <ul>
              <li>Target operasi sebaiknya ditetapkan pada x ≥ 0,95, bukan pada batas minimum 0,90.</li>
              <li>Pengendalian level separator merupakan parameter operasional yang paling menentukan terjadinya carryover.</li>
              <li>Pembersihan dan penggantian demister perlu dijadwalkan rutin untuk menjaga efisiensi pemisahan.</li>
              <li>Pemantauan daring memungkinkan peringatan dini sebelum nilai melewati batas operasi.</li>
            </ul>
          </Callout>
        </section>

        <References entries={references} />
      </ArticleBody>
    </ArticleLayout>
  );
}
