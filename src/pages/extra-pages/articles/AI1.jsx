import featureImportanceImg from 'assets/images/articles/AI1/feature_importance_chart.jpg';
import isolationForestImg from 'assets/images/articles/AI1/isolation_forest_concept.jpg';

import ArticleBody from 'components/landing/article/ArticleBody';
import ArticleLayout from 'components/landing/article/ArticleLayout';
import Callout from 'components/landing/article/Callout';
import Citation from 'components/landing/article/Citation';
import Figure from 'components/landing/article/Figure';
import References from 'components/landing/article/References';
import prose from 'components/landing/article/Prose.module.css';

const sections = [
  { id: 'pendahuluan', label: 'Pendahuluan' },
  { id: 'isolation-forest', label: 'Isolation Forest' },
  { id: 'overall-risk', label: 'Overall Risk History' },
  { id: 'anotasi', label: 'Anotasi arah parameter' },
  { id: 'turbine-risk', label: 'Turbine Risk History' },
  { id: 'soh', label: 'State of Health turbin' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
  { id: 'dafpus', label: 'Daftar pustaka' }
];

// Tabel 5.28: profil skor risiko Turbine Risk History per rezim operasi.
const regimes = [
  { regime: 'Beban penuh stabil', score: '4% sampai 15%' },
  { regime: 'Penurunan beban ringan, di dalam window latih', score: '30% sampai 32%' },
  { regime: 'Separuh beban berkelanjutan setelah pemadaman', score: '70% sampai 75%' },
  { regime: 'Window kondisi berhenti operasi (425 window)', score: '83,0% rata-rata' }
];

// Tabel 5.29: laju deteksi anomali sintetis satu-parameter.
const detection = [
  { kind: 'Spike', turbine: '100%', overall: '4,5%' },
  { kind: 'Drift', turbine: '100%', overall: '6,0%' },
  { kind: 'Stuck-at', turbine: '100%', overall: '6,5%' },
  { kind: 'Dropout', turbine: '100%', overall: '5,0%' }
];

const references = [
  {
    author: 'PT Pertamina dan Universitas Padjadjaran.',
    title: 'Laporan Termin 4 Bab 5: Pengembangan Online Steam Quality and Purity Monitoring Smart System',
    source: 'Laporan Penelitian',
    year: 2026
  },
  {
    author: 'Liu, F. T., Ting, K. M., Zhou, Z. H.',
    title: 'Isolation Forest',
    source: 'Proceedings of the 8th IEEE International Conference on Data Mining',
    year: 2008
  },
  {
    author: 'Cox, D. R.',
    title: 'Regression Models and Life-Tables',
    source: 'Journal of the Royal Statistical Society, Series B, 34(2)',
    year: 1972
  },
  { author: 'Abernethy, R. B.', title: 'The New Weibull Handbook', source: 'Edisi kelima', year: 2006 },
  {
    author: 'Chandola, V., Banerjee, A., Kumar, V.',
    title: 'Anomaly Detection: A Survey',
    source: 'ACM Computing Surveys, 41(3)',
    year: 2009
  }
];

// ==============================|| ARTICLE - AI 1 ||============================== //

export default function AI1() {
  return (
    <ArticleLayout
      eyebrow="Analisis data"
      title="Deteksi anomali dan penilaian risiko turbin"
      lead="Tiga modul berbasis Isolation Forest dan model hazard Weibull yang mengubah data operasi menjadi skor risiko."
    >
      <ArticleBody sections={sections}>
        <section id="pendahuluan" className={prose.prose}>
          <h2>Pendahuluan</h2>
          <p>
            Lapisan analisis risiko pada sistem pemantauan terdiri atas tiga modul yang saling terkait. Overall Risk History menilai
            keseluruhan kondisi operasi unit, Turbine Risk History menilai kualitas uap yang memasuki turbin, dan State of Health Turbin
            menerjemahkan skor risiko tersebut menjadi laju penuaan terhadap siklus overhaul rencana.
            <Citation num={1} />
          </p>
        </section>

        <section id="isolation-forest" className={prose.prose}>
          <h2>Isolation Forest sebagai detektor anomali</h2>
          <p>
            Isolation Forest merupakan metode deteksi anomali tanpa supervisi yang bekerja dengan mengisolasi titik data melalui pemisahan
            acak berulang. Titik yang menyimpang dari mayoritas data memerlukan lebih sedikit pemisahan untuk terisolasi, sehingga panjang
            lintasan rata-ratanya pada kumpulan pohon acak menjadi lebih pendek. Panjang lintasan inilah yang dikonversi menjadi skor
            anomali.
            <Citation num={2} />
          </p>
          <p>
            Metode ini dipilih karena tidak memerlukan label kegagalan, yang memang tidak tersedia pada unit yang belum pernah mengalami
            kegagalan dalam rentang data yang ada.
            <Citation num={5} />
          </p>

          <Figure
            src={isolationForestImg}
            alt="Diagram konsep Isolation Forest"
            caption="Gambar 1. Konsep isolasi titik anomali melalui pemisahan acak berulang."
          />
        </section>

        <section id="overall-risk" className={prose.prose}>
          <h2>Overall Risk History</h2>
          <p>
            Modul ini menarik window data 60 menit untuk 14 parameter sensor SCADA setiap 60 detik melalui API. Siklus dibatalkan apabila
            window tidak lengkap atau mengandung nilai kosong, dan dilewati apabila waktu sensor belum bergerak maju dari siklus sebelumnya.
            Window yang lolos dinormalisasi, diekstraksi menjadi fitur, dinilai oleh model, dikonversi menjadi skor risiko, lalu disimpan.
            <Citation num={1} />
          </p>
          <p>
            Ekstraksi fitur mengambil lima ciri statistik dari setiap parameter, yaitu rata-rata, standar deviasi, nilai minimum, nilai
            maksimum, dan laju perubahan. Dengan 14 parameter, setiap window menghasilkan 70 fitur turunan. Model Isolation Forest kemudian
            membandingkan pola 70 fitur tersebut terhadap pola yang teramati selama periode operasi normal historis.
          </p>

          <Callout label="Makna skor risiko" tone="warning">
            <p>
              Skor risiko adalah ukuran seberapa jauh pola statistik satu window menyimpang dari pola operasi normal historis. Skor tinggi
              berarti kombinasi pembacaan sensor pada periode tersebut secara statistik tidak biasa dibandingkan riwayat operasi normal.
              Angka ini bukan diagnosis kerusakan fisik yang spesifik, dan tidak boleh dibaca sebagai penunjuk komponen tertentu yang sedang
              rusak.
            </p>
          </Callout>

          <Figure
            src={featureImportanceImg}
            alt="Diagram kontribusi parameter terhadap skor risiko"
            caption="Gambar 2. Kontribusi relatif parameter terhadap skor risiko yang dihasilkan."
          />
        </section>

        <section id="anotasi" className={prose.prose}>
          <h2>Lapisan anotasi arah parameter</h2>
          <p>
            Isolation Forest bersifat simetris dan tidak memiliki pengetahuan bawaan mengenai arah yang menguntungkan atau merugikan untuk
            tiap parameter. Akibatnya, penurunan TDS yang secara proses justru menguntungkan tetap dapat ditandai sebagai kondisi tidak
            normal. Lapisan anotasi arah parameter dibangun untuk mengatasi keterbatasan ini.
            <Citation num={1} />
          </p>
          <p>
            Lapisan ini menandai parameter penggerak beserta arahnya dan menghasilkan kolom skor terkoreksi pada tabel terpisah, tanpa
            mengubah skor asli sama sekali. Pemisahan ini penting agar jejak audit skor asli tetap utuh.
          </p>
          <p>
            Seluruh 70.611 baris riwayat yang tersedia telah dianotasi. Dari 8.245 window yang memiliki TDS sebagai parameter penggerak,
            4.626 window tanpa penggerak pendamping seluruhnya lolos gate koreksi, 2.033 dari 3.619 window dengan penggerak pendamping ikut
            lolos, dan 1.586 window dibatalkan oleh penggerak pendamping yang arahnya terkonfirmasi merugikan. Secara keseluruhan, 6.659
            dari 8.245 window atau 80,8% lolos gate koreksi.
          </p>
        </section>

        <section id="turbine-risk" className={prose.prose}>
          <h2>Turbine Risk History</h2>
          <p>
            Modul ini menjalankan model Isolation Forest terpisah pada enam parameter kualitas uap, menghasilkan 30 fitur turunan per
            window. Pembagian datanya terdiri atas 7.370 window latih, 1.698 window validasi, dan 1.021 window uji.
            <Citation num={1} />
          </p>
          <p>
            Laju positif palsu tercatat sebesar 0,98% pada blok latih dan 6,48% pada blok validasi, tetapi mencapai 100% pada blok uji.
            Nilai terakhir tersebut bukan indikasi model yang rusak. Seluruh blok uji jatuh pada periode setelah pemadaman penuh, ketika
            unit menyala kembali di sekitar separuh beban. Pergeseran rezim operasinya terukur pada nilai rata-rata fitur, yaitu laju alir
            yang turun dari 0,828 menjadi 0,208 dan temperatur yang turun dari 0,796 menjadi 0,223 pada skala ternormalisasi yang sama.
            Model menandai seluruh blok uji sebagai tidak normal karena blok tersebut memang tidak menyerupai kondisi operasi mana pun yang
            pernah dilihatnya.
          </p>
          <p>
            Laju positif palsu karena itu bukan ukuran yang informatif untuk modul ini pada data yang tersedia. Sebagai gantinya digunakan
            profil skor risiko harian per rezim operasi.
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 1. Profil skor risiko Turbine Risk History per rezim operasi.</caption>
              <thead>
                <tr>
                  <th scope="col">Rezim operasi</th>
                  <th scope="col">Rentang skor risiko rata-rata harian</th>
                </tr>
              </thead>
              <tbody>
                {regimes.map((row) => (
                  <tr key={row.regime}>
                    <th scope="row">{row.regime}</th>
                    <td>{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Profil tersebut menunjukkan modul ini memisahkan rezim operasi dengan urutan yang masuk akal secara fisis. Beban penuh stabil
            menghasilkan skor rendah, penurunan beban ringan menaikkannya secara moderat, sedangkan kondisi separuh beban dan berhenti
            operasi menghasilkan skor tinggi yang bertahan. Urutan inilah yang membuat keluarannya layak dipakai sebagai penggerak laju
            penuaan.
          </p>

          <h3>Deteksi anomali sintetis</h3>
          <p>
            Pengujian dilakukan dengan 200 sampel per jenis gangguan yang dibangun dari blok uji, menggunakan pengali delapan kali standar
            deviasi untuk spike dan lima kali untuk drift.
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 2. Laju deteksi anomali sintetis satu parameter pada kedua modul.</caption>
              <thead>
                <tr>
                  <th scope="col">Jenis anomali</th>
                  <th scope="col">Turbine Risk History (6 parameter)</th>
                  <th scope="col">Overall Risk History (14 parameter)</th>
                </tr>
              </thead>
              <tbody>
                {detection.map((row) => (
                  <tr key={row.kind}>
                    <th scope="row">{row.kind}</th>
                    <td>{row.turbine}</td>
                    <td>{row.overall}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Callout label="Interpretasi" tone="warning">
            <p>
              Selisih pada Tabel 2 tidak boleh dibaca sebagai bukti bahwa Turbine Risk History merupakan detektor yang lebih baik.
              Perbedaannya berasal dari proporsi fitur yang terganggu, bukan dari mutu model. Mengganggu satu parameter pada modul ini
              berarti mengganggu satu dari enam masukannya, sedangkan pada Overall Risk History hanya satu dari empat belas. Konsekuensinya
              berlaku dua arah: modul dengan masukan sedikit lebih peka terhadap gangguan satu sensor, tetapi juga lebih rentan menandai
              perubahan rezim operasi yang sah sebagai anomali.
            </p>
          </Callout>

          <p>
            Terdapat satu keterbatasan tambahan. Dua dari enam masukan modul ini, yaitu Dryness Fraction dan NCG, hampir sepenuhnya dapat
            dijelaskan oleh empat masukan lainnya. Regresi linear terhadap rata-rata tekanan, temperatur, dan TDS per window menghasilkan
            koefisien determinasi 0,991 untuk Dryness Fraction dan 0,985 untuk NCG. Hal ini wajar karena kedua nilai tersebut memang
            diprediksi dari ketiga parameter itu oleh modul sensor virtual. Keduanya tetap disertakan karena keenam parameter dipilih atas
            dasar perannya dalam kualitas uap, tetapi klaim bahwa modul ini menilai enam sumber informasi yang independen tidak dapat
            dipertahankan.
          </p>
        </section>

        <section id="soh" className={prose.prose}>
          <h2>State of Health turbin</h2>
          <p>
            Modul ini menjawab satu pertanyaan perawatan yang konkret, yaitu apakah overhaul mayor berikutnya perlu dimajukan, dengan
            horizon kerja sepanjang satu siklus overhaul rencana. Panjang siklus rencana yang digunakan adalah empat tahun, dengan rentang
            yang masih dapat dipertanggungjawabkan dua sampai enam tahun, disusun dari beberapa PLTP yang berbeda.
            <Citation num={1} />
          </p>
          <p>
            Keluarannya dinyatakan sebagai State of Health, yaitu persentase sisa jatah siklus berjalan pada skala 0 sampai 100. Nilai 100
            berarti siklus baru saja dimulai, sedangkan nilai 0 berarti jatah siklus telah habis. Perlu ditegaskan bahwa nilai 0 berarti
            waktunya dilakukan Turn Around, bukan berarti turbin telah rusak.
          </p>

          <Callout label="Status validasi" tone="warning">
            <p>
              Modul ini bukan model machine learning yang divalidasi terhadap kejadian kegagalan, melainkan model heuristik rekayasa
              keandalan yang dikalibrasi dari angka industri. Unit yang dipantau belum pernah mengalami kegagalan dalam rentang data yang
              tersedia, dan dari tiga overhaul yang tercatat hanya satu yang terjadi ketika data sensor sudah ada. Seluruh angka yang
              dihasilkan karena itu hanya boleh dibaca sebagai perbandingan skenario relatif, bukan prediksi yang tervalidasi.
            </p>
          </Callout>

          <h3>Bentuk model</h3>
          <p>
            Model berbentuk fungsi hazard Weibull yang dipercepat oleh skor Turbine Risk History melalui suku Cox proportional hazards.
            Parameter bentuk Weibull ditetapkan sebesar 2,5 secara a priori mengikuti teknik Weibayes, karena tidak tersedia kejadian
            kegagalan untuk mengestimasinya.
            <Citation num={4} />
            Koefisien Cox ditetapkan sebesar logaritma natural dari 2, dikalibrasi agar kedua model berimpit ketika skor risiko berada pada
            dua kali nilai acuannya.
            <Citation num={3} />
          </p>
          <p>
            Penuaan diakumulasi sebagai integrasi umur efektif tertimbang waktu nyata antar sampel, bukan tertimbang jumlah baris, sehingga
            hasilnya tidak berubah ketika cadence data berubah. Uji invariansi cadence mengonfirmasi hal ini: sinyal fisis yang sama
            disampling per satu menit, dua menit, satu jam, dan satu hari menghasilkan penuaan yang identik sampai orde 1e-12 relatif.
          </p>
          <p>
            Uji mandiri utama modul ini membandingkan dua skenario pembebanan dengan rata-rata skor risiko tertimbang waktu yang identik
            sebesar 23,33%, yaitu skenario berdenyut berupa empat jam pada skor 90% dan 20 jam pada skor 10%, melawan kondisi rata yang
            setara. Model yang peka terhadap bentuk sebaran seharusnya menilai skenario berdenyut lebih merusak, dan pengujian ini digunakan
            untuk memverifikasi sifat tersebut.
          </p>
        </section>

        <section id="kesimpulan" className={prose.prose}>
          <h2>Kesimpulan</h2>
          <p>
            Ketiga modul bekerja pada tingkat abstraksi yang berbeda. Overall Risk History memberikan gambaran menyeluruh kondisi operasi
            dengan 14 parameter, Turbine Risk History memberikan sensitivitas lebih tinggi pada enam parameter kualitas uap, dan State of
            Health Turbin menerjemahkan skor risiko menjadi laju penuaan terhadap siklus overhaul rencana.
          </p>
          <p>
            Keterbatasan masing-masing modul telah terdokumentasi dan perlu diperhatikan saat membaca keluarannya. Skor risiko merupakan
            ukuran penyimpangan statistik, bukan diagnosis kerusakan. Sensitivitas Turbine Risk History yang lebih tinggi berasal dari
            jumlah masukan yang lebih sedikit, bukan dari mutu model. State of Health Turbin merupakan model heuristik yang belum divalidasi
            terhadap kejadian kegagalan.
          </p>
        </section>

        <References entries={references} />
      </ArticleBody>
    </ArticleLayout>
  );
}
