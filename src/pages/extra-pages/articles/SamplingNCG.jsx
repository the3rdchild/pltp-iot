import ncgCompositionChart from 'assets/images/articles/ncg/ncg_composition_chart.jpg';
import abatementSystem from 'assets/images/articles/ncg/abatement_system.jpg';

import ArticleBody from 'components/landing/article/ArticleBody';
import ArticleLayout from 'components/landing/article/ArticleLayout';
import Callout from 'components/landing/article/Callout';
import Citation from 'components/landing/article/Citation';
import Figure from 'components/landing/article/Figure';
import References from 'components/landing/article/References';
import prose from 'components/landing/article/Prose.module.css';

const sections = [
  { id: 'pendahuluan', label: 'Pendahuluan' },
  { id: 'lokasi', label: 'Lokasi dan peralatan' },
  { id: 'keselamatan', label: 'Aspek keselamatan' },
  { id: 'prosedur', label: 'Prosedur sampling' },
  { id: 'analisis', label: 'Analisis laboratorium' },
  { id: 'data', label: 'Data PLTP Kamojang' },
  { id: 'kendala', label: 'Kendala umum' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
  { id: 'dafpus', label: 'Daftar pustaka' }
];

const samplingPoints = [
  {
    point: 'Wellhead',
    purpose: 'Karakterisasi fluida reservoir',
    condition: '150 sampai 300 °C, 10 sampai 30 bar',
    equipment: 'Sampling line stainless steel dengan cooling coil, Giggenbach bottle'
  },
  {
    point: 'Separator outlet',
    purpose: 'Pemantauan NCG dalam uap setelah pemisahan brine',
    condition: '5 sampai 8 bar, 160 sampai 170 °C',
    equipment: 'Sampling nozzle dengan water trap, Giggenbach bottle'
  },
  {
    point: 'Condenser outlet',
    purpose: 'Pemantauan NCG yang diekstraksi ejektor',
    condition: '0,1 sampai 0,15 bar, 45 sampai 55 °C',
    equipment: 'Analyzer gas daring NDIR dan elektrokimia, Giggenbach bottle berkala'
  },
  {
    point: 'Udara ambien',
    purpose: 'Pemantauan kepatuhan emisi H₂S',
    condition: 'Beberapa titik di sekitar cooling tower dan wellpad',
    equipment: 'Detektor H₂S portabel, pemantau arah angin'
  }
];

const h2sExposure = [
  { range: '0 sampai 10 ppm', effect: 'Bau telur busuk dan iritasi mata' },
  { range: '10 sampai 50 ppm', effect: 'Sakit kepala, mual, kehilangan daya penciuman' },
  { range: '50 sampai 100 ppm', effect: 'Kerusakan mata dan gangguan pernapasan' },
  { range: 'di atas 100 ppm', effect: 'Kehilangan kesadaran dalam hitungan menit, berpotensi fatal' }
];

const kamojangData = [
  { date: '15-Jan-2023', loc: 'KMJ-42 Wellhead', co2: '91,2', h2s: '2,3', n2: '5,1', ch4: '3.400', ncg: '1,15' },
  { date: '15-Jan-2023', loc: 'Unit 3 Condenser', co2: '93,8', h2s: '1,8', n2: '3,6', ch4: '2.800', ncg: '1,08' },
  { date: '12-Mar-2023', loc: 'KMJ-37 Wellhead', co2: '89,5', h2s: '2,8', n2: '6,2', ch4: '4.100', ncg: '1,23' },
  { date: '12-Mar-2023', loc: 'Unit 1 Condenser', co2: '94,1', h2s: '1,6', n2: '3,4', ch4: '2.500', ncg: '1,05' },
  { date: '08-Jun-2023', loc: 'KMJ-51 Separator', co2: '92,6', h2s: '2,1', n2: '4,5', ch4: '3.200', ncg: '1,12' },
  { date: '08-Jun-2023', loc: 'Unit 2 Condenser', co2: '93,3', h2s: '1,9', n2: '4,0', ch4: '2.900', ncg: '1,10' },
  { date: '20-Sep-2023', loc: 'KMJ-42 Wellhead', co2: '90,8', h2s: '2,5', n2: '5,4', ch4: '3.600', ncg: '1,18' },
  { date: '20-Sep-2023', loc: 'Unit 3 Condenser', co2: '94,5', h2s: '1,5', n2: '3,2', ch4: '2.400', ncg: '1,03' },
  { date: '15-Dec-2023', loc: 'KMJ-37 Separator', co2: '91,9', h2s: '2,2', n2: '4,8', ch4: '3.300', ncg: '1,14' },
  { date: '15-Dec-2023', loc: 'Unit 1 Condenser', co2: '93,6', h2s: '1,7', n2: '3,8', ch4: '2.700', ncg: '1,07' },
  { date: '22-Feb-2024', loc: 'KMJ-51 Wellhead', co2: '90,3', h2s: '2,7', n2: '5,6', ch4: '3.800', ncg: '1,21' },
  { date: '22-Feb-2024', loc: 'Unit 2 Condenser', co2: '94,0', h2s: '1,6', n2: '3,5', ch4: '2.600', ncg: '1,06' },
  { date: '10-May-2024', loc: 'KMJ-42 Separator', co2: '92,1', h2s: '2,0', n2: '4,7', ch4: '3.100', ncg: '1,11' },
  { date: '10-May-2024', loc: 'Unit 3 Condenser', co2: '93,9', h2s: '1,8', n2: '3,6', ch4: '2.800', ncg: '1,08' },
  { date: '18-Aug-2024', loc: 'KMJ-37 Wellhead', co2: '89,8', h2s: '2,9', n2: '5,9', ch4: '4.200', ncg: '1,25' }
];

const references = [
  {
    author: 'Giggenbach, W. F.',
    title: 'A simple method for the collection and analysis of volcanic gas samples',
    source: 'Bulletin of Volcanology, Vol. 39',
    year: 1975
  },
  {
    author: 'USGS California Volcano Observatory.',
    title: 'Gas Geochemistry Laboratory Methodology',
    source: 'USGS Technical Documentation',
    year: 2024
  },
  {
    author: 'IAVCEI Commission.',
    title: 'Direct Sampling Group: Giggenbach Method Protocol',
    source: 'IAVCEI Technical Report',
    year: 2001
  },
  {
    author: 'ThinkGeoEnergy.',
    title: 'Treating non-condensable gases (NCG) of geothermal plants: experience by Mannvit',
    source: 'ThinkGeoEnergy',
    year: 2019
  },
  {
    author: 'World Bank ESMAP.',
    title: 'Geothermal handbook: Planning and financing power generation',
    source: 'ESMAP Technical Report',
    year: 2012
  },
  {
    author: 'Evans, W. C. dkk.',
    title: 'Gas sampling methods for geothermal and volcanic systems',
    source: 'USGS Technical Report',
    year: 1973
  },
  {
    author: 'Lab-Training.',
    title: 'Sampling of Gases for analysis by Gas Chromatography',
    source: 'Lab Training Online Resources',
    year: 2020
  },
  {
    author: 'Alphasense Ltd.',
    title: 'Air Quality Sensors: Toxic Gas Sensors Technical Datasheet',
    source: 'Alphasense Product Documentation',
    year: 2024
  },
  {
    author: 'KROHNE.',
    title: 'Gas analysis systems for geothermal power generation',
    source: 'KROHNE Technical Documentation',
    year: 2020
  },
  { author: 'Putra, A. D.', title: 'Analisis Dispersi H₂S dan NH₃ dari PLTP Kamojang', source: 'Digital Library ITB', year: 2016 },
  {
    author: 'Suyanto dkk.',
    title: 'Implementation SCADA Web Client For Monitoring Geothermal Power Plant 3 MW Kamojang, Indonesia',
    source: 'International Conference Proceedings',
    year: 2022
  },
  { author: 'EPRI.', title: 'Corrosion of Materials Used in Geothermal Power Production', source: 'EPRI Technical Report', year: 2016 }
];

// ==============================|| ARTICLE - SAMPLING NCG ||============================== //

export default function SamplingNCG() {
  return (
    <ArticleLayout
      eyebrow="Metode pengukuran"
      title="Pengambilan data Non Condensable Gas"
      lead="Prosedur sampling metode Giggenbach, analisis kromatografi gas, dan hasil pengukuran di PLTP Kamojang."
    >
      <ArticleBody sections={sections}>
        <section id="pendahuluan" className={prose.prose}>
          <h2>Pendahuluan</h2>
          <p>
            Pengukuran kandungan NCG memerlukan pengambilan sampel yang representatif, karena komposisi gas berubah mengikuti titik
            pengambilan dan kondisi operasi. Metode Giggenbach merupakan standar internasional untuk pengambilan sampel gas panas bumi, dan
            menjadi dasar prosedur yang diuraikan di sini.
            <Citation num={1} />
            <Citation num={2} />
          </p>

          <Figure
            src={ncgCompositionChart}
            alt="Diagram komposisi NCG pada beberapa lapangan panas bumi"
            caption="Gambar 1. Variasi komposisi NCG yang menjadi dasar penentuan titik dan frekuensi sampling."
          />
        </section>

        <section id="lokasi" className={prose.prose}>
          <h2>Lokasi sampling dan persiapan peralatan</h2>
          <p>
            Pemilihan lokasi sampling menentukan representativitas data. Empat titik berikut digunakan pada PLTP, masing-masing dengan
            tujuan dan kondisi operasi yang berbeda.
            <Citation num={4} />
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 1. Titik pengambilan sampel NCG pada PLTP.</caption>
              <thead>
                <tr>
                  <th scope="col">Titik</th>
                  <th scope="col">Tujuan</th>
                  <th scope="col">Kondisi</th>
                  <th scope="col">Peralatan</th>
                </tr>
              </thead>
              <tbody>
                {samplingPoints.map((row) => (
                  <tr key={row.point}>
                    <th scope="row">{row.point}</th>
                    <td>{row.purpose}</td>
                    <td>{row.condition}</td>
                    <td>{row.equipment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Titik condenser outlet merupakan yang paling penting untuk pemantauan operasi, karena mewakili gas yang akan diekstraksi oleh
            sistem gas removal dan berkorelasi langsung dengan kinerja kondensor.
            <Citation num={5} />
          </p>

          <h3>Daftar peralatan</h3>
          <p>Peralatan sampling mencakup:</p>
          <ul>
            <li>Giggenbach bottle berukuran 300 sampai 500 mL dalam kondisi tervakum</li>
            <li>Larutan NaOH 4 sampai 6 M yang disiapkan segar</li>
            <li>Sampling tube berbahan titanium atau SS316</li>
            <li>Cooling coil tembaga sepanjang 2 sampai 3 meter</li>
            <li>Water trap dan separator</li>
            <li>Pressure gauge dan termometer</li>
          </ul>
          <p>Peralatan keselamatan dan dokumentasi mencakup:</p>
          <ul>
            <li>Detektor H₂S portabel dengan rentang 0 sampai 100 ppm</li>
            <li>Alat pelindung diri berupa sarung tangan tahan panas, kacamata pelindung, dan respirator</li>
            <li>Suplai air pendingin</li>
            <li>Stopwatch, logbook lapangan, dan label sampel</li>
            <li>Kotak pendingin untuk transportasi sampel di bawah 4 °C</li>
          </ul>
        </section>

        <section id="keselamatan" className={prose.prose}>
          <h2>Aspek keselamatan</h2>

          <h3>Toksisitas H₂S</h3>
          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 2. Efek paparan H₂S menurut konsentrasi.</caption>
              <thead>
                <tr>
                  <th scope="col">Konsentrasi</th>
                  <th scope="col">Efek</th>
                </tr>
              </thead>
              <tbody>
                {h2sExposure.map((row) => (
                  <tr key={row.range}>
                    <th scope="row">{row.range}</th>
                    <td>{row.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout label="Kelelahan olfaktori" tone="warning">
            <p>
              Pada konsentrasi di atas 100 ppm, H₂S melumpuhkan saraf penciuman sehingga gas tidak lagi tercium. Hilangnya bau karena itu
              tidak boleh diartikan sebagai tanda kondisi aman, dan pemantauan wajib bergantung pada detektor, bukan pada indra.
              <Citation num={8} />
            </p>
          </Callout>

          <h3>Bahaya temperatur dan tekanan</h3>
          <p>
            Uap pada 150 sampai 300 °C dapat menimbulkan luka bakar derajat tiga secara seketika, dan pelepasan tekanan mendadak berpotensi
            menimbulkan ledakan uap. Penggunaan alat pelindung diri lengkap, cooling coil, serta depresurisasi bertahap bersifat wajib.
          </p>

          <h3>Risiko asfiksia akibat CO₂</h3>
          <p>
            CO₂ memiliki densitas lebih besar daripada udara sehingga terakumulasi di area rendah. Konsentrasi di atas 5% menimbulkan
            kesulitan bernapas dan peningkatan denyut jantung, sedangkan di atas 10% dapat menyebabkan hilangnya kesadaran. Memasuki ruang
            terbatas tanpa ventilasi dan detektor gas tidak diperbolehkan.
          </p>

          <Callout label="Protokol wajib">
            <ul>
              <li>Pengambilan sampel dilakukan minimal oleh dua orang, dengan satu orang bertugas sebagai pengawas keselamatan.</li>
              <li>Detektor H₂S portabel harus aktif dengan alarm audio selama seluruh kegiatan.</li>
              <li>Posisi petugas berada di arah angin atas terhadap titik sampling.</li>
              <li>Rencana tanggap darurat berupa jalur evakuasi, titik kumpul, dan perlengkapan P3K harus tersedia.</li>
              <li>Komunikasi dengan control room dilakukan secara berkala setiap 15 menit.</li>
            </ul>
          </Callout>
        </section>

        <section id="prosedur" className={prose.prose}>
          <h2>Prosedur sampling metode Giggenbach</h2>

          <h3>Persiapan sehari sebelumnya</h3>
          <ol>
            <li>
              <strong>Persiapan botol.</strong> Botol pyrex 500 mL dibersihkan dengan detergen dan dibilas air deionisasi, divakumkan hingga
              di bawah 5 mbar, kemudian diisi 50 sampai 100 mL larutan NaOH 4 M melalui septum. Botol ditutup dengan teflon stopcock dan
              diberi label berisi tanggal, lokasi, nama petugas, serta nomor botol.
              <Citation num={3} />
            </li>
            <li>
              <strong>Penyiapan sampling line.</strong> Tube titanium atau SS316 berdiameter luar 6 sampai 8 mm disambungkan ke sampling
              port, dilengkapi cooling coil tembaga sepanjang 2 sampai 3 meter untuk menurunkan temperatur ke 60 sampai 80 °C, serta water
              trap sebelum botol untuk menahan kondensat.
            </li>
          </ol>

          <h3>Pelaksanaan di lapangan</h3>
          <ol>
            <li>
              <strong>Purging selama 5 sampai 10 menit.</strong> Katup sampling dibuka agar uap mengalir melalui sampling line untuk
              mengeluarkan udara dan kondensat, sampai aliran stabil dan temperatur konstan.
            </li>
            <li>
              <strong>Penyambungan botol.</strong> Sampling line disambungkan ke inlet botol, kemudian stopcock dibuka secara perlahan
              selama 10 sampai 15 detik. Penurunan tekanan yang mendadak dapat memecahkan botol.
            </li>
            <li>
              <strong>Pengumpulan gas selama 10 sampai 20 menit.</strong> Larutan NaOH menyerap gas asam berupa CO₂ dan H₂S, ditandai dengan
              perubahan warna larutan. Target pengumpulan adalah 100 sampai 200 mL gas inert pada headspace.
              <Citation num={6} />
            </li>
            <li>
              <strong>Penutupan dan penimbangan.</strong> Stopcock ditutup rapat, botol ditimbang dengan ketelitian ±0,01 g, kemudian data
              waktu sampling, tekanan, temperatur, dan kondisi cuaca dicatat. Botol disimpan tegak dalam kotak pendingin.
            </li>
          </ol>

          <Callout label="Kesalahan yang perlu dihindari" tone="warning">
            <ul>
              <li>Purging yang tidak cukup menyebabkan udara tersisa di dalam sampling line sehingga pembacaan CO₂ menjadi keliru.</li>
              <li>Ketiadaan water trap menyebabkan air cair masuk ke botol dan mengencerkan larutan NaOH.</li>
              <li>Temperatur uap di atas 100 °C berisiko memecahkan botol atau merusak gasket.</li>
              <li>
                Laju alir yang terlalu tinggi menyebabkan penyerapan tidak sempurna sehingga kandungan CO₂ dan H₂S terukur lebih rendah.
              </li>
              <li>Sambungan yang bocor memungkinkan udara masuk setelah sampling dan membatalkan hasil analisis.</li>
            </ul>
          </Callout>
        </section>

        <section id="analisis" className={prose.prose}>
          <h2>Analisis laboratorium dan kendali mutu</h2>
          <p>
            Gas pada headspace Giggenbach bottle dianalisis menggunakan kromatografi gas untuk memperoleh komposisi masing-masing komponen.
            <Citation num={7} />
          </p>
          <ol>
            <li>
              <strong>Ekstraksi sampel.</strong> Headspace botol disambungkan ke gas-tight syringe berukuran 500 µL sampai 1 mL, dan gas
              ditarik perlahan untuk menghindari kejut tekanan.
            </li>
            <li>
              <strong>Injeksi dan pemisahan.</strong> Sampel diinjeksikan ke inlet port, dengan gas pembawa helium atau argon mengalirkannya
              melalui kolom kapiler. Program temperatur dimulai pada 40 °C dengan laju kenaikan 10 °C per menit hingga 250 °C, dan waktu
              analisis 15 sampai 30 menit.
            </li>
            <li>
              <strong>Deteksi dan kuantifikasi.</strong> Thermal conductivity detector mendeteksi H₂, N₂, CO₂, dan Ar; flame ionization
              detector mendeteksi hidrokarbon; pulsed discharge detector mendeteksi He dan gas renik.
            </li>
            <li>
              <strong>Pengolahan data.</strong> Luas puncak diintegrasikan dan dibandingkan terhadap kurva kalibrasi standar untuk
              memperoleh konsentrasi tiap gas.
            </li>
          </ol>

          <h3>Kendali mutu</h3>
          <ul>
            <li>
              <strong>Analisis duplikat.</strong> Setiap sampel dianalisis minimal dua kali, dengan kriteria keberterimaan simpangan baku
              relatif di bawah 5% untuk konsentrasi di atas 1% dan di bawah 10% untuk gas renik.
            </li>
            <li>
              <strong>Verifikasi kalibrasi.</strong> Gas standar bersertifikat dianalisis setiap sepuluh sampel, dengan akurasi dalam ±5%
              terhadap nilai sertifikat.
            </li>
            <li>
              <strong>Analisis blanko.</strong> Sampel blanko dianalisis setiap hari, dan tidak boleh menghasilkan puncak di atas batas
              deteksi.
            </li>
            <li>
              <strong>Penutupan neraca massa.</strong> Jumlah seluruh persentase gas harus berada pada 100 ± 3%.
            </li>
            <li>
              <strong>Pembandingan data historis.</strong> Data baru dibandingkan terhadap rerata enam bulan, dan perubahan mendadak di atas
              20% tanpa perubahan operasi yang diketahui memerlukan pengambilan sampel ulang.
            </li>
          </ul>
        </section>

        <section id="data" className={prose.prose}>
          <h2>Data sampling PLTP Kamojang</h2>
          <p>
            Tabel berikut memuat hasil sampling NCG dari beberapa titik di PLTP Kamojang pada periode 2023 sampai 2024.
            <Citation num={11} />
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 3. Hasil sampling NCG di PLTP Kamojang periode 2023 sampai 2024.</caption>
              <thead>
                <tr>
                  <th scope="col">Tanggal</th>
                  <th scope="col">Lokasi</th>
                  <th scope="col">CO₂ (%)</th>
                  <th scope="col">H₂S (%)</th>
                  <th scope="col">N₂ (%)</th>
                  <th scope="col">CH₄ (ppm)</th>
                  <th scope="col">Total NCG (% wt)</th>
                </tr>
              </thead>
              <tbody>
                {kamojangData.map((row) => (
                  <tr key={`${row.date}-${row.loc}`}>
                    <th scope="row">{row.date}</th>
                    <td>{row.loc}</td>
                    <td>{row.co2}</td>
                    <td>{row.h2s}</td>
                    <td>{row.n2}</td>
                    <td>{row.ch4}</td>
                    <td>{row.ncg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>Pembahasan hasil</h3>
          <p>
            <strong>Rentang kandungan NCG.</strong> Nilai pada wellhead berkisar 1,15 sampai 1,25% berat, pada separator 1,11 sampai 1,14%,
            dan pada kondensor 1,03 sampai 1,10%. Kandungan NCG menurun secara konsisten dari wellhead menuju kondensor.
          </p>
          <p>
            <strong>Komposisi gas.</strong> CO₂ mendominasi pada 89 sampai 95%, H₂S berkisar 1,5 sampai 2,9%, N₂ pada 3,2 sampai 6,2%, dan
            CH₄ pada tingkat renik 2.400 sampai 4.200 ppm. Proporsi ini tipikal untuk lapangan panas bumi di Indonesia.
          </p>
          <p>
            <strong>Variasi musiman.</strong> Kandungan NCG pada Februari sampai Mei sedikit lebih tinggi dibandingkan Juni sampai
            September. Perbedaan ini diduga berkaitan dengan pengaruh imbuhan air hujan terhadap tekanan reservoir, dan masih memerlukan
            verifikasi lebih lanjut.
          </p>

          <Callout label="Implikasi operasional">
            <ul>
              <li>Kapasitas gas ejector dirancang untuk kandungan NCG maksimum 1,25% dengan margin desain 20%.</li>
              <li>Scrubber H₂S harus mampu mengolah kandungan 1,5 sampai 2,9%, dengan konsumsi NaOH 15 sampai 20 kg per jam.</li>
              <li>Pada kandungan 1,03 sampai 1,10% di kondensor, penurunan efisiensi turbin berkisar 0,9 sampai 1,0%.</li>
              <li>Frekuensi sampling ditetapkan bulanan untuk wellhead dan mingguan untuk pemantauan kondensor.</li>
              <li>Kandungan di atas 1,3% pada kondensor menjadi ambang tindakan untuk menelusuri kinerja gas ejector.</li>
            </ul>
          </Callout>

          <Figure
            src={abatementSystem}
            alt="Skema sistem abatement dan reinjeksi NCG"
            caption="Gambar 2. Sistem abatement dan reinjeksi yang mengolah gas hasil ekstraksi."
          />
        </section>

        <section id="kendala" className={prose.prose}>
          <h2>Kendala umum dan penanganannya</h2>

          <h3>Botol pecah saat sampling</h3>
          <p>
            Gejalanya berupa keretakan atau pecahnya botol serta hilangnya kevakuman. Penyebabnya adalah kejut termal akibat kontak uap
            panas dengan botol dingin, kejut tekanan karena stopcock dibuka terlalu cepat, atau retak mikro pada botol bekas pakai.
            Penanganannya adalah penggunaan cooling coil agar temperatur uap di bawah 80 °C, pembukaan stopcock selama 10 sampai 15 detik,
            pemanasan awal botol dengan air 60 sampai 70 °C, serta pemeriksaan botol sebelum digunakan.
          </p>

          <h3>Kontaminasi udara</h3>
          <p>
            Gejalanya berupa konsentrasi O₂ yang tinggi pada hasil kromatografi, yang seharusnya di bawah 0,1%, serta N₂ yang melampaui
            rentang normal. Penyebabnya adalah purging yang tidak memadai, sambungan yang bocor, atau kevakuman botol yang tidak terjaga.
            Penanganannya meliputi purging minimal sepuluh menit, pengujian kebocoran pada seluruh sambungan, serta pengujian kevakuman
            botol selama lebih dari 24 jam sebelum dibawa ke lapangan. Sampel dengan O₂ di atas 0,5% dinyatakan tidak valid.
          </p>

          <h3>Kualitas puncak kromatogram menurun</h3>
          <p>
            Gejalanya berupa puncak yang tidak simetris, puncak bayangan, sensitivitas rendah, atau pergeseran garis dasar. Penyebabnya
            adalah degradasi kolom, kontaminasi injection port, ketidakmurnian gas pembawa, atau pengotoran detektor. Penanganannya meliputi
            pemanasan kolom pada 250 °C selama dua jam, pembersihan liner injection port, penggantian filter gas pembawa, serta pemeliharaan
            detektor.
          </p>

          <h3>Hasil tidak konsisten antar pengambilan</h3>
          <p>
            Gejalanya berupa perubahan nilai NCG yang besar pada tiga pengambilan berturut-turut atau simpangan baku relatif di atas 10%
            antar duplikat. Penyebabnya adalah pengambilan sampel saat beban unit berubah, ketidakkonsistenan lokasi pengambilan, atau
            kesalahan nilai tekanan dan temperatur dalam perhitungan. Sampling hanya dilakukan pada kondisi tunak, yaitu beban stabil dalam
            rentang ±5% selama minimal dua jam.
            <Citation num={12} />
          </p>
        </section>

        <section id="kesimpulan" className={prose.prose}>
          <h2>Kesimpulan</h2>
          <p>
            Keandalan data NCG bergantung pada tiga hal, yaitu pemilihan titik sampling yang sesuai dengan tujuan pengukuran, pelaksanaan
            prosedur Giggenbach yang disiplin terutama pada tahap purging dan pembukaan stopcock, serta penerapan kendali mutu di
            laboratorium melalui analisis duplikat, verifikasi kalibrasi, dan penutupan neraca massa.
          </p>
          <p>
            Pengukuran daring menggunakan analyzer NDIR dan elektrokimia melengkapi sampling berkala dengan menyediakan data kontinu, dan
            hasilnya divalidasi silang terhadap analisis kromatografi gas di laboratorium.
            <Citation num={9} />
            <Citation num={10} />
          </p>
        </section>

        <References entries={references} />
      </ArticleBody>
    </ArticleLayout>
  );
}
