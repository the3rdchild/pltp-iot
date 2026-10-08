import sc4500Img from 'assets/images/SC4500.webp';
import dashboardImg from 'assets/images/articles/tds/pertasmart_dashboard.webp';
import pltpSystemImg from 'assets/images/articles/tds/pltp_system_diagram.png';

import ArticleBody from 'components/landing/article/ArticleBody';
import ArticleLayout from 'components/landing/article/ArticleLayout';
import Callout from 'components/landing/article/Callout';
import Citation from 'components/landing/article/Citation';
import Figure from 'components/landing/article/Figure';
import References from 'components/landing/article/References';
import prose from 'components/landing/article/Prose.module.css';

const sections = [
  { id: 'pendahuluan', label: 'Pendahuluan' },
  { id: 'pengambilan', label: 'Pengambilan sampel' },
  { id: 'pengondisian', label: 'Pengondisian sampel' },
  { id: 'pengukuran', label: 'Pengukuran konduktivitas' },
  { id: 'konversi', label: 'Konversi digital' },
  { id: 'keluaran', label: 'Keluaran sinyal' },
  { id: 'integrasi', label: 'Integrasi analyzer' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
  { id: 'dafpus', label: 'Daftar pustaka' }
];

const sensorModels = [
  { model: '8315', constant: '0,01 cm⁻¹', range: '0,01 sampai 200 µS/cm', use: 'Ultra pure water' },
  { model: '8316', constant: '0,1 cm⁻¹', range: '0,1 sampai 2.000 µS/cm', use: 'Pure water' },
  { model: '8317', constant: '1 cm⁻¹', range: '1 sampai 20.000 µS/cm', use: 'Process water' }
];

const conversionFactors = [
  { medium: 'Pure water atau demineralized water', factor: '0,55' },
  { medium: 'Natural water atau groundwater', factor: '0,65' },
  { medium: 'Seawater atau brine', factor: '0,70' },
  { medium: 'Fluida panas bumi', factor: '0,55 sampai 0,65' }
];

const currentMapping = [
  { tds: '0 mg/L', output: '4 mA' },
  { tds: '250 mg/L', output: '8 mA' },
  { tds: '500 mg/L', output: '12 mA' },
  { tds: '750 mg/L', output: '16 mA' },
  { tds: '1.000 mg/L', output: '20 mA' }
];

const references = [
  {
    author: 'PT Pertamina Research & Technology Innovation.',
    title: 'Hookup Drawing: Schematic Sampling Conditioning System TDS Analyzer',
    source: 'Technical Drawing, Rev. 0',
    year: 2025
  },
  {
    author: 'Hach Company.',
    title: 'Contacting Conductivity Sensors Models 8315, 8316, 8317',
    source: 'Product Technical Data, LIT2820 Rev 2',
    year: 2022
  },
  { author: 'Hach Company.', title: 'Digital Controller SC4500', source: 'Product Specification Sheet, DOC053.53.35316', year: 2023 },
  {
    author: 'Hach Company.',
    title: '5500 sc Silica Analyzer',
    source: 'Product Brochure and Technical Specifications, Section 13400',
    year: 2024
  },
  { author: 'Hach Company.', title: 'EZ1000 Series Chloride Analyzers', source: 'Product Technical Data, DOC053.53.35185', year: 2022 },
  { author: 'Hach Company.', title: 'NA5600sc Online Sodium Analyzer', source: 'Product Brochure, DOC053.53.35149', year: 2019 },
  {
    author: 'ASTM International.',
    title: 'ASTM D1125: Standard Test Methods for Electrical Conductivity and Resistivity of Water',
    source: 'ASTM Standards',
    year: 2014
  },
  {
    author: 'International Organization for Standardization.',
    title: 'ISO 7888:1985 Water quality: Determination of electrical conductivity',
    source: 'ISO',
    year: 1985
  }
];

// ==============================|| ARTICLE - SAMPLING TDS ||============================== //

export default function SamplingTDS() {
  return (
    <ArticleLayout
      eyebrow="Metode pengukuran"
      title="Pengambilan data Total Dissolved Solid"
      lead="Rangkaian proses dari pengambilan sampel fisik pada jalur produksi hingga penyajiannya sebagai data digital."
    >
      <ArticleBody sections={sections}>
        <section id="pendahuluan" className={prose.prose}>
          <h2>Pendahuluan</h2>
          <p>
            Pemantauan Total Dissolved Solid pada sistem panas bumi merupakan parameter kritis untuk mencegah kerusakan turbin akibat
            scaling, korosi, dan carryover. Uraian berikut menjelaskan proses pengambilan data TDS mulai dari pengambilan sampel fisik
            hingga konversinya menjadi sinyal digital yang terbaca oleh sistem pemantauan PertaSmart.
          </p>

          <Callout label="Definisi">
            <p>
              TDS adalah ukuran konsentrasi total zat padat terlarut, meliputi mineral, garam, dan logam, dalam air. Nilainya dinyatakan
              dalam mg/L atau ppm. Nilai TDS yang tinggi mengindikasikan risiko scaling dan korosi pada turbin.
            </p>
          </Callout>

          <Figure
            src={pltpSystemImg}
            alt="Skema sistem PLTP dengan titik pengambilan sampel"
            caption="Gambar 1. Skema sistem PLTP dengan titik pengambilan sampel TDS."
          />
        </section>

        <section id="pengambilan" className={prose.prose}>
          <h2>Pengambilan sampel dari main pipe</h2>
          <p>
            Sampel fluida panas bumi diambil dari <em>main pipe</em> menggunakan <strong>sample probe retractable</strong>. Probe ini dapat
            dipasang dan dilepas tanpa menghentikan sistem melalui metode <em>hot tapping</em>, sehingga perawatan dapat dilakukan tanpa
            downtime. Sampel kemudian dialirkan melalui tube SS316 berdiameter 1/2 inci.
            <Citation num={1} />
          </p>
          <p>
            Stainless steel 316 dipilih karena ketahanannya terhadap korosi pada lingkungan panas bumi yang mengandung H<sub>2</sub>S, CO
            <sub>2</sub>, dan mineral korosif, serta ketahanannya terhadap tekanan dan temperatur tinggi.
          </p>

          <Callout label="Kondisi sampel pada tahap ini" tone="warning">
            <ul>
              <li>Fase: uap panas</li>
              <li>Tekanan: 2 sampai 87 psi</li>
              <li>Temperatur: di atas 100 °C</li>
              <li>Status: belum dapat diukur dan memerlukan pengondisian terlebih dahulu</li>
            </ul>
          </Callout>
        </section>

        <section id="pengondisian" className={prose.prose}>
          <h2>Pengondisian sampel</h2>

          <h3>Penurunan temperatur</h3>
          <p>
            Sampel panas dari main pipe melewati <strong>sample cooler</strong> yang menurunkan temperatur dari di atas 100 °C menjadi
            sekitar 50 °C. Nilai tersebut dipilih atas tiga pertimbangan.
            <Citation num={1} />
          </p>
          <ul>
            <li>
              <strong>Keselamatan sensor.</strong> Sensor konduktivitas HACH 3422 memiliki batas temperatur operasi 150 °C, dengan kondisi
              optimal pada 5 sampai 45 °C.
            </li>
            <li>
              <strong>Akurasi pengukuran.</strong> Konduktivitas sensitif terhadap temperatur dengan perubahan sekitar 2% per 1 °C, sehingga
              temperatur perlu dijaga stabil.
            </li>
            <li>
              <strong>Konsistensi data.</strong> Setpoint temperatur yang konstan menjamin keterulangan pengukuran.
            </li>
          </ul>
          <p>
            Sistem pendingin menggunakan <em>water cooling coil</em> dengan aliran air pendingin melalui tube SS316 berdiameter 1/2 inci.
            Proses ini mengubah fase sampel dari uap menjadi cair sehingga dapat diukur oleh sensor konduktivitas.{' '}
            <strong>Thermal safety valve</strong> Sentry 7-03634J terpasang sebagai proteksi, dan membuka secara otomatis untuk mengalirkan
            sampel panas ke drain apabila temperatur melampaui setpoint.
          </p>

          <h3>Stabilisasi tekanan</h3>
          <p>
            Setelah pendinginan, tekanan sampel diatur menggunakan <strong>pressure regulator</strong> DK-LOK KPR1ELA412A20000 pada nilai 15
            psi. Nilai ini berada di tengah rentang operasi sensor 2 sampai 87 psi, menghasilkan laju alir yang konsisten, dan cukup tinggi
            untuk mencegah keluarnya gas terlarut dari larutan. Tekanan dipantau melalui <strong>pressure gauge</strong> Wika 232.50 dengan
            rentang 0 sampai 30 psi.
            <Citation num={1} />
          </p>

          <h3>Pengendalian laju alir</h3>
          <p>
            Laju alir sampel dikendalikan pada 100 sampai 300 mL/menit menggunakan <strong>variable area flowmeter</strong> Swagelok
            VAF-M41-1-B6L-0. Rentang tersebut cukup cepat untuk menjaga sampel yang melewati sensor tetap segar, menghasilkan waktu tinggal
            yang optimal pada measurement cell, sekaligus menjaga efisiensi konsumsi sampel. Ball valve DK-LOK SS-43GS4 dan SS-43GS8
            terpasang pada beberapa titik untuk isolasi, sehingga pemeliharaan sensor dapat dilakukan tanpa menghentikan keseluruhan sistem.
            <Citation num={1} />
          </p>

          <Callout label="Kondisi sampel setelah pengondisian">
            <ul>
              <li>Fase: cair</li>
              <li>Temperatur: sekitar 50 °C dan terkendali</li>
              <li>Tekanan: 15 psi dan stabil</li>
              <li>Laju alir: 100 sampai 300 mL/menit</li>
            </ul>
          </Callout>
        </section>

        <section id="pengukuran" className={prose.prose}>
          <h2>Pengukuran konduktivitas</h2>
          <p>
            Sampel yang telah dikondisikan masuk ke <strong>conductivity sensor HACH 3422</strong>. Sensor ini menggunakan teknologi
            <em> contacting conductivity</em> dengan konfigurasi dua elektroda. HACH menyediakan tiga model dengan cell constant yang
            berbeda, dan pemilihannya bergantung pada rentang konduktivitas yang diharapkan.
            <Citation num={2} />
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 1. Model sensor konduktivitas dan rentang pengukurannya.</caption>
              <thead>
                <tr>
                  <th scope="col">Model</th>
                  <th scope="col">Cell constant</th>
                  <th scope="col">Rentang</th>
                  <th scope="col">Peruntukan</th>
                </tr>
              </thead>
              <tbody>
                {sensorModels.map((row) => (
                  <tr key={row.model}>
                    <th scope="row">{row.model}</th>
                    <td>{row.constant}</td>
                    <td>{row.range}</td>
                    <td>{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Elektroda terbuat dari stainless steel 316L pada model 8315 dan 8316, atau grafit pada model 8317. O-ring gasket FKM menjamin
            penyekatan, dan sensor terintegrasi dengan <strong>PT100 temperature sensor</strong> untuk kompensasi temperatur otomatis.
            <Citation num={2} />
          </p>

          <h3>Prinsip pengukuran</h3>
          <p>
            Konduktivitas adalah kemampuan larutan menghantarkan arus listrik. Pada air panas bumi, ion terlarut seperti Na<sup>+</sup>, Cl
            <sup>−</sup>, Ca<sup>2+</sup>, dan SO<sub>4</sub>
            <sup>2−</sup> berperan sebagai pembawa muatan, sehingga konduktivitas meningkat seiring konsentrasi ion. Pengukuran berlangsung
            dalam empat tahap.
          </p>
          <ol>
            <li>
              <strong>Aplikasi tegangan bolak-balik.</strong> Controller SC4500 memberikan tegangan AC pada elektroda pertama. Penggunaan
              arus bolak-balik diperlukan untuk mencegah polarisasi elektroda.
            </li>
            <li>
              <strong>Pergerakan ion.</strong> Tegangan AC menyebabkan ion bergerak bolak-balik di antara kedua elektroda.
            </li>
            <li>
              <strong>Aliran arus.</strong> Pergerakan ion menghasilkan arus listrik yang besarnya proporsional terhadap konsentrasi ion dan
              tegangan yang diaplikasikan.
            </li>
            <li>
              <strong>Perhitungan konduktivitas.</strong> Controller mengukur arus dan menghitung konduktivitas melalui hubungan G = κ ×
              (A/L), dengan G adalah conductance, κ adalah konduktivitas, dan A/L adalah cell constant.
            </li>
          </ol>

          <h3>Kompensasi temperatur otomatis</h3>
          <p>
            Konduktivitas berubah sekitar 2% untuk setiap kenaikan 1 °C, sehingga pembacaan perlu dinormalisasi ke temperatur referensi 25
            °C. Sensor PT100 yang terintegrasi mengukur temperatur sampel secara waktu nyata, dan controller menerapkan koreksi menggunakan
            koefisien temperatur yang dapat dikonfigurasi. Tanpa kompensasi ini, pembacaan pada 30 °C dapat 10% lebih tinggi dibandingkan
            pembacaan pada 25 °C untuk sampel yang sama.
            <Citation num={2} />
          </p>
        </section>

        <section id="konversi" className={prose.prose}>
          <h2>Konversi digital dan kalkulasi TDS</h2>
          <p>
            Sinyal konduktivitas dikirim ke <strong>SC4500 digital controller</strong>, sebuah instrumen berbasis mikroprosesor yang
            menjalankan enam fungsi: menyuplai tegangan AC ke sensor, mengakuisisi sinyal arus, memproses sinyal analog melalui ADC presisi,
            menerapkan koreksi temperatur, menghitung nilai konduktivitas, dan mengonversinya menjadi nilai TDS.
            <Citation num={3} />
          </p>

          <h3>Formula konversi</h3>
          <p>
            Konduktivitas tidak secara langsung menyatakan TDS karena setiap jenis ion memberikan kontribusi konduktivitas yang berbeda.
            Hubungan keduanya bersifat empiris dan dinyatakan sebagai berikut.
          </p>
          <p>
            <strong>TDS (mg/L) = konduktivitas (µS/cm) × faktor konversi</strong>
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 2. Faktor konversi konduktivitas ke TDS menurut jenis media.</caption>
              <thead>
                <tr>
                  <th scope="col">Media</th>
                  <th scope="col">Faktor konversi</th>
                </tr>
              </thead>
              <tbody>
                {conversionFactors.map((row) => (
                  <tr key={row.medium}>
                    <th scope="row">{row.medium}</th>
                    <td>{row.factor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Faktor konversi dapat dikonfigurasi sesuai karakteristik fluida di lapangan. Kalibrasi awal dilakukan dengan membandingkan
            pembacaan sensor terhadap hasil analisis laboratorium menggunakan metode gravimetri.
            <Citation num={3} />
          </p>

          <p>
            Controller dilengkapi layar sentuh LCD berwarna 5,7 inci yang menampilkan nilai TDS terkini, parameter sekunder berupa
            konduktivitas dan temperatur, grafik tren historis, status diagnostik sensor, serta menu konfigurasi. Fitur Prognosys pada
            perangkat ini memperkirakan kegagalan sensor berdasarkan analisis tren, sehingga pemeliharaan dapat dijadwalkan secara
            preventif.
            <Citation num={3} />
          </p>

          <Figure
            src={sc4500Img}
            alt="Controller SC4500"
            caption="Gambar 2. Digital controller SC4500 sebagai pengolah sinyal sensor konduktivitas."
          />
        </section>

        <section id="keluaran" className={prose.prose}>
          <h2>Keluaran sinyal</h2>

          <h3>Keluaran analog 4 sampai 20 mA</h3>
          <p>
            SC4500 mengonversi nilai TDS digital menjadi sinyal analog <em>current loop</em> 4 sampai 20 mA. Standar ini dipilih atas empat
            pertimbangan.
            <Citation num={3} />
          </p>
          <ul>
            <li>
              <strong>Ketahanan terhadap derau.</strong> Sinyal arus jauh lebih tahan terhadap gangguan elektromagnetik dibandingkan sinyal
              tegangan.
            </li>
            <li>
              <strong>Jarak transmisi.</strong> Sinyal dapat ditransmisikan hingga ratusan meter tanpa degradasi.
            </li>
            <li>
              <strong>Live zero.</strong> Batas bawah 4 mA, bukan 0 mA, memungkinkan deteksi putus kabel. Arus 0 mA berarti kegagalan
              sambungan, bukan pembacaan rendah.
            </li>
            <li>
              <strong>Kompatibilitas.</strong> Sinyal terbaca oleh sistem SCADA, DCS, dan PLC tanpa pengondisian sinyal tambahan.
            </li>
          </ul>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 3. Pemetaan nilai TDS ke arus keluaran pada rentang 0 sampai 1.000 mg/L.</caption>
              <thead>
                <tr>
                  <th scope="col">Nilai TDS</th>
                  <th scope="col">Arus keluaran</th>
                </tr>
              </thead>
              <tbody>
                {currentMapping.map((row) => (
                  <tr key={row.tds}>
                    <th scope="row">{row.tds}</th>
                    <td>{row.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Hubungan tersebut mengikuti persamaan keluaran (mA) = 4 + (TDS / rentang maksimum) × 16. Controller menyediakan hingga lima
            keluaran 4 sampai 20 mA terisolasi yang dapat dikonfigurasi secara independen, masing-masing dengan impedansi beban maksimum 600
            ohm.
          </p>

          <h3>Keluaran relai</h3>
          <p>
            Selain keluaran analog, SC4500 menyediakan empat hingga enam keluaran relai yang dapat dikonfigurasi untuk alarm TDS tinggi,
            alarm TDS rendah, indikasi kegagalan sistem, pengendalian katup blowdown, serta pengaturan urutan sampling multi-stream. Kontak
            relai memiliki rating 5 A pada 240 VAC untuk beban resistif.
            <Citation num={3} />
          </p>

          <h3>Protokol komunikasi digital</h3>
          <p>
            Controller mendukung Modbus RTU melalui RS485, Modbus TCP/IP melalui Ethernet, Profibus DP, serta protokol HART. Perangkat juga
            dapat terhubung ke platform Hach Claros untuk pemantauan jarak jauh, pencatatan data otomatis, dan peringatan pemeliharaan.
            <Citation num={3} />
          </p>

          <h3>Integrasi dengan dashboard PertaSmart</h3>
          <p>
            Pada sistem pemantauan PLTP yang dikembangkan PT Pertamina bersama Universitas Padjadjaran, data TDS mengalir melalui empat
            lapisan. Lapisan perangkat keras mengubah keluaran 4 sampai 20 mA menjadi nilai digital melalui modul akuisisi data menuju
            gateway IoT. Lapisan komunikasi mengirimkan data melalui protokol MQTT ke server. Lapisan aplikasi menerima, menyimpan, dan
            menyajikan data melalui REST API. Lapisan presentasi menampilkannya pada antarmuka dashboard secara waktu nyata.
          </p>

          <Figure
            src={dashboardImg}
            alt="Tangkapan layar dashboard PertaSmart pada Unit 5 Kamojang yang menampilkan nilai TDS, dryness fraction, NCG, serta parameter tekanan, temperatur, dan daya"
            caption="Gambar 3. Panel sistem pemantauan kualitas uap di lapangan."
          />
        </section>

        <section id="integrasi" className={prose.prose}>
          <h2>Integrasi dengan analyzer parameter lain</h2>
          <p>
            Sistem pemantauan kualitas air panas bumi yang komprehensif tidak hanya mengukur TDS, tetapi juga parameter spesifik lain yang
            kritis bagi operasi turbin. Nilai TDS berfungsi sebagai rujukan dasar bagi analyzer lainnya.
          </p>

          <h3>HACH 5500sc silica analyzer</h3>
          <p>
            Mengukur silika reaktif pada rentang 0,5 sampai 5.000 µg/L menggunakan metode kolorimetri silicomolybdate pada panjang gelombang
            815 nm, dengan waktu respons 9,5 menit dan akurasi ±1%. Silika merupakan komponen utama penyebab scaling pada sudu turbin. Nilai
            TDS yang tinggi umumnya berkorelasi dengan silika yang tinggi. Apabila TDS naik sementara silika tetap rendah, kenaikan tersebut
            kemungkinan berasal dari spesi ionik lain seperti klorida atau sulfat.
            <Citation num={4} />
          </p>

          <h3>EZ1000 chloride analyzer</h3>
          <p>
            Mengukur ion klorida pada rentang 1 sampai 10 mg/L melalui presipitasi perak klorida dengan deteksi turbidimetri pada panjang
            gelombang 480 nm. Klorida merupakan indikator kuat bagi potensi korosi.
            <Citation num={5} />
          </p>

          <h3>NA5600sc sodium analyzer</h3>
          <p>
            Mengukur ion natrium pada rentang 0,01 ppb sampai 200 ppm menggunakan elektroda selektif ion setelah pengondisian pH, dengan
            waktu respons T90 kurang dari 3 menit dan batas deteksi 0,01 ppb. Natrium merupakan parameter paling kritis bagi kemurnian uap,
            dengan target kurang dari 2 ppb. Nilai di atas batas tersebut mengindikasikan terjadinya carryover. Natrium umumnya menyusun 30
            sampai 50% dari TDS pada brine panas bumi, sehingga rasio Na terhadap TDS yang tidak wajar menandakan perubahan kimia reservoir
            atau kontaminasi dari sumber eksternal.
            <Citation num={6} />
          </p>

          <Callout label="Integrasi multi-parameter">
            <ul>
              <li>
                Seluruh analyzer terhubung ke dashboard melalui sistem akuisisi data terpadu, sehingga nilai TDS, silika, klorida, dan
                natrium dapat dikorelasikan.
              </li>
              <li>Logika alarm multi-parameter memungkinkan keputusan yang lebih tepat dibandingkan alarm parameter tunggal.</li>
              <li>Analitik berbasis tren dari beberapa parameter digunakan untuk memperkirakan potensi scaling, korosi, dan carryover.</li>
            </ul>
          </Callout>
        </section>

        <section id="kesimpulan" className={prose.prose}>
          <h2>Kesimpulan</h2>
          <p>
            Proses pengambilan data TDS merupakan rangkaian konversi properti fisik berupa konduktivitas ionik menjadi data digital. Setiap
            tahap, mulai dari ekstraksi sampel, pengondisian, pengukuran, hingga konversi digital, dirancang agar data yang dihasilkan
            akurat, andal, dan tersedia secara waktu nyata.
          </p>
          <p>
            Metode pengukuran mengacu pada standar ASTM D1125 dan ISO 7888 untuk penentuan konduktivitas listrik air.
            <Citation num={7} />
            <Citation num={8} />
          </p>

          <Callout label="Poin utama">
            <ul>
              <li>Pengondisian sampel pada temperatur, tekanan, dan laju alir yang presisi merupakan prasyarat akurasi pengukuran.</li>
              <li>Sensor konduktivitas dua elektroda memiliki konstruksi sederhana dengan tingkat keandalan yang tinggi.</li>
              <li>Controller tidak hanya mengukur, tetapi juga menerapkan kompensasi temperatur dan algoritma konversi.</li>
              <li>Keluaran 4 sampai 20 mA memungkinkan integrasi dengan sistem kendali yang telah terpasang tanpa perangkat tambahan.</li>
            </ul>
          </Callout>
        </section>

        <References entries={references} />
      </ArticleBody>
    </ArticleLayout>
  );
}
