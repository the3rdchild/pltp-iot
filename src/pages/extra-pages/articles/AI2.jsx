import lstmArchImg from 'assets/images/articles/AI2/lstm_architecture.jpg';
import multiStepImg from 'assets/images/articles/AI2/ai_data_flow.jpg';
import trainingLossImg from 'assets/images/articles/AI2/training_validation_loss.jpg';

import ArticleBody from 'components/landing/article/ArticleBody';
import ArticleLayout from 'components/landing/article/ArticleLayout';
import Callout from 'components/landing/article/Callout';
import Citation from 'components/landing/article/Citation';
import Figure from 'components/landing/article/Figure';
import References from 'components/landing/article/References';
import prose from 'components/landing/article/Prose.module.css';

const sections = [
  { id: 'pendahuluan', label: 'Pendahuluan' },
  { id: 'latar', label: 'Latar belakang' },
  { id: 'konsep', label: 'Konsep sensor virtual' },
  { id: 'lstm', label: 'Arsitektur LSTM' },
  { id: 'implementasi', label: 'Implementasi' },
  { id: 'validasi', label: 'Hasil validasi' },
  { id: 'kontrol', label: 'Eksperimen kontrol' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
  { id: 'dafpus', label: 'Daftar pustaka' }
];

// Tabel 5.24 Laporan Termin 4 Bab 5: LOOCV pada 44 sampel laboratorium.
const loocv = [
  { target: 'Dryness Fraction', floor: '0,1259', lstm: '0,1396', verdict: 'Tidak melampaui baseline' },
  { target: 'NCG', floor: '0,0236', lstm: '0,0244', verdict: 'Tidak melampaui baseline' }
];

// Tabel 5.26: kontrol positif, nowcast TDS sensor pada window data sehat.
const control = [
  { model: 'Regresi linear', input: 'Temperatur TDS saja', mae: '0,1188', proportion: '97,4%' },
  { model: 'Regresi linear', input: '14 parameter', mae: '0,1368', proportion: '97,2%' },
  { model: 'LSTM', input: 'Temperatur TDS saja', mae: '0,2730', proportion: '88,7%' }
];

const references = [
  {
    author: 'PT Pertamina dan Universitas Padjadjaran.',
    title: 'Laporan Termin 4 Bab 5: Pengembangan Online Steam Quality and Purity Monitoring Smart System',
    source: 'Laporan Penelitian',
    year: 2026
  },
  {
    author: 'Kadlec, P., Gabrys, B., Strandt, S.',
    title: 'Data-driven Soft Sensors in the Process Industry',
    source: 'Computers & Chemical Engineering, 33(4)',
    year: 2009
  },
  { author: 'Hochreiter, S., Schmidhuber, J.', title: 'Long Short-Term Memory', source: 'Neural Computation, 9(8)', year: 1997 },
  { author: 'Olah, C.', title: 'Understanding LSTM Networks', source: "colah's blog", year: 2015 },
  {
    author: 'Taieb, S. B., Bontempi, G., Atiya, A. F., Sorjamaa, A.',
    title: 'A Review and Comparison of Strategies for Multi-step Ahead Time Series Forecasting',
    source: 'Expert Systems with Applications',
    year: 2012
  },
  {
    author: 'Gal, Y., Ghahramani, Z.',
    title: 'Dropout as a Bayesian Approximation: Representing Model Uncertainty in Deep Learning',
    source: 'Proceedings of ICML',
    year: 2016
  }
];

// ==============================|| ARTICLE - AI 2 ||============================== //

export default function AI2() {
  return (
    <ArticleLayout
      eyebrow="Analisis data"
      title="Sensor virtual LSTM untuk Dryness Fraction dan NCG"
      lead="Rancangan model, implementasi pada data operasi, dan hasil validasinya terhadap 44 sampel laboratorium."
    >
      <ArticleBody sections={sections}>
        <section id="pendahuluan" className={prose.prose}>
          <h2>Pendahuluan</h2>
          <p>
            Modul Dryness Prediction dan NCG Prediction merupakan sensor virtual berbasis jaringan <em>Long Short-Term Memory</em> yang
            mengestimasi nilai dryness fraction dan kandungan NCG dari parameter operasi yang terukur secara langsung. Uraian berikut
            menjelaskan rancangan model, cara implementasinya pada data operasi PLTP Kamojang, serta hasil validasinya.
            <Citation num={1} />
          </p>

          <Callout label="Status modul" tone="warning">
            <p>
              Hasil validasi menunjukkan estimasi kedua modul ini belum melampaui baseline statistik sederhana. Keluarannya karena itu
              berstatus penunjang dan belum dapat menggantikan sampling laboratorium sebagai acuan untuk keputusan operasi. Bagian
              <a href="#validasi"> Hasil validasi</a> menguraikan angkanya secara lengkap.
            </p>
          </Callout>
        </section>

        <section id="latar" className={prose.prose}>
          <h2>Latar belakang</h2>
          <p>
            Dryness fraction dan kandungan NCG merupakan parameter penentu kualitas uap, tetapi pengukurannya memerlukan pengambilan sampel
            manual dan analisis laboratorium. Konsekuensinya ada empat.
          </p>
          <ul>
            <li>Hasil pengukuran baru tersedia setelah proses analisis selesai, sehingga bersifat indikator tertinggal.</li>
            <li>Frekuensi pengambilan yang umumnya bulanan menghasilkan data yang sangat jarang.</li>
            <li>Kondisi di antara dua waktu pengambilan tidak terekam.</li>
            <li>Pengambilan sampel dari jalur uap bertekanan dan bertemperatur tinggi memiliki risiko keselamatan.</li>
          </ul>
          <p>
            Sensor virtual dikembangkan untuk mengisi rentang waktu di antara dua pengambilan sampel tersebut, bukan untuk menggantikan
            pengukuran laboratorium.
          </p>
        </section>

        <section id="konsep" className={prose.prose}>
          <h2>Konsep sensor virtual</h2>
          <p>
            Sensor virtual, atau <em>soft sensor</em>, adalah model yang mengestimasi parameter yang sulit atau mahal diukur menggunakan
            parameter lain yang tersedia secara langsung. Pendekatan ini mensyaratkan adanya hubungan fisis antara parameter masukan dan
            parameter target, serta tersedianya data berlabel yang memadai untuk pelatihan dan evaluasi.
            <Citation num={2} />
          </p>
          <p>
            Pada penerapan ini, masukan berupa tekanan, temperatur, dan TDS yang terukur secara kontinu, sedangkan targetnya adalah dryness
            fraction dan kandungan NCG yang hanya tersedia dari hasil analisis laboratorium.
          </p>

          <Figure
            src={multiStepImg}
            alt="Diagram alir data sistem analisis"
            caption="Gambar 1. Alir data dari akuisisi sensor menuju modul estimasi."
          />
        </section>

        <section id="lstm" className={prose.prose}>
          <h2>Arsitektur LSTM</h2>
          <p>
            LSTM merupakan varian jaringan saraf rekuren yang dirancang untuk mengatasi masalah <em>vanishing gradient</em> pada pemrosesan
            deret waktu yang panjang. Setiap sel LSTM memiliki <em>cell state</em> yang membawa informasi antar langkah waktu, serta tiga
            gerbang yang mengatur aliran informasi tersebut.
            <Citation num={3} />
          </p>
          <ul>
            <li>
              <strong>Forget gate.</strong> Menentukan bagian informasi pada cell state sebelumnya yang dibuang.
            </li>
            <li>
              <strong>Input gate.</strong> Menentukan informasi baru dari masukan saat ini yang disimpan ke dalam cell state.
            </li>
            <li>
              <strong>Output gate.</strong> Menentukan bagian cell state yang diteruskan sebagai keluaran pada langkah waktu tersebut.
            </li>
          </ul>
          <p>
            Ketiga gerbang menggunakan fungsi aktivasi sigmoid yang menghasilkan nilai antara 0 dan 1, sehingga berperan sebagai penapis
            proporsional terhadap informasi yang melewatinya.
            <Citation num={4} />
          </p>

          <Figure src={lstmArchImg} alt="Diagram arsitektur sel LSTM" caption="Gambar 2. Struktur sel LSTM beserta ketiga gerbangnya." />
        </section>

        <section id="implementasi" className={prose.prose}>
          <h2>Implementasi pada data operasi</h2>
          <p>
            Setiap siklus eksekusi menarik window data 60 menit untuk parameter tekanan, temperatur, dan TDS melalui API. Siklus dilewati
            apabila waktu sensor belum bergerak maju dari siklus sebelumnya, dan dibatalkan apabila tidak terdapat pembacaan yang valid.
            <Citation num={1} />
          </p>
          <ol>
            <li>Rata-rata ketiga parameter pada window tersebut dihitung.</li>
            <li>
              Nilai TDS sensor dipetakan ke skala laboratorium melalui <em>quantile mapping</em>, yang menyelaraskan distribusi pembacaan
              sensor terhadap distribusi hasil laboratorium.
            </li>
            <li>Ketiga parameter dinormalisasi sebagai masukan model.</li>
            <li>Keluaran model dikembalikan ke skala asli sebagai estimasi dryness fraction dan NCG.</li>
            <li>
              Setiap baris keluaran diberi status yang mengikuti status kalibrasi quantile mapping TDS, lalu disimpan bersama nilai
              confidence.
            </li>
          </ol>
          <p>
            Status kalibrasi quantile mapping telah final karena syarat kecukupan datanya terpenuhi, yaitu cakupan 80 hari data sensor
            dengan rasio koefisien variasi laboratorium terhadap sensor sebesar 1,1 kali. Pencantuman status pada setiap baris keluaran
            dimaksudkan agar pembaca data mengetahui tingkat kepercayaan estimasi yang ditampilkan.
          </p>
        </section>

        <section id="validasi" className={prose.prose}>
          <h2>Hasil validasi</h2>
          <p>
            Evaluasi akurasi dilakukan dengan <em>leave-one-out cross-validation</em> pada 44 sampel laboratorium yang tersedia, dengan
            pembanding berupa <em>mean-predictor</em> sebagai baseline. Baseline ini selalu memprediksi nilai rata-rata data latih, sehingga
            model yang tidak mampu melampauinya berarti belum menangkap informasi apa pun dari parameter masukannya.
            <Citation num={1} />
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 1. Hasil LOOCV pada 44 sampel laboratorium (Tabel 5.24 laporan).</caption>
              <thead>
                <tr>
                  <th scope="col">Target</th>
                  <th scope="col">MAE baseline</th>
                  <th scope="col">MAE LSTM terbaik</th>
                  <th scope="col">Hasil</th>
                </tr>
              </thead>
              <tbody>
                {loocv.map((row) => (
                  <tr key={row.target}>
                    <th scope="row">{row.target}</th>
                    <td>{row.floor}</td>
                    <td>{row.lstm}</td>
                    <td>{row.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Kontrol regresi linear juga tidak mengungguli baseline, dengan MAE dryness 0,1309 pada R² sebesar −0,122 dan MAE NCG 0,0234 pada
            R² sebesar +0,007. Uji bootstrap berpasangan dengan 20.000 resample terhadap varian fitur tunggal maupun kombinasi menunjukkan
            tidak ada konfigurasi yang mengungguli baseline secara signifikan, karena seluruh selisih interval kepercayaan 95% melintasi
            nol.
          </p>
          <p>
            Lebar interval kepercayaan tersebut merupakan konsekuensi langsung dari ukuran sampel yang hanya 44 titik data laboratorium.
            Analisis korelasi menunjukkan bahwa TDS, parameter yang menjadi dasar pengadaan sensor baru, praktis tidak berkorelasi dengan
            kedua target pada sampel yang tersedia.
          </p>

          <Callout label="Implikasi operasional" tone="warning">
            <p>
              Nilai R² yang negatif berarti variasi keluaran model berpotensi berlawanan arah dengan kondisi sebenarnya. Apabila dibaca
              sebagai angka presisi tanpa konteks keterbatasan ini, keluaran Dryness Prediction dan NCG Prediction berisiko lebih
              menyesatkan daripada informatif. Sampling laboratorium bulanan tetap menjadi acuan kebenaran, dan keluaran kedua modul ini
              belum dapat menggantikannya untuk keputusan operasional.
            </p>
          </Callout>

          <Figure
            src={trainingLossImg}
            alt="Kurva training dan validation loss"
            caption="Gambar 3. Kurva training dan validation loss selama proses pelatihan model."
          />
        </section>

        <section id="kontrol" className={prose.prose}>
          <h2>Eksperimen kontrol positif</h2>
          <p>
            Untuk menguji apakah keterbatasan tersebut berasal dari pilihan arsitektur atau dari kekuatan sinyal dan ukuran sampel, disusun
            eksperimen kontrol positif. Arsitektur dan pipeline yang sama dipertahankan, tetapi targetnya diganti menjadi nilai TDS sensor
            pada waktu yang sama, yaitu target yang diketahui memiliki sinyal masukan kuat karena kanal temperatur dan kanal TDS berasal
            dari satu instrumen.
            <Citation num={1} />
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>
                Tabel 2. Kontrol positif nowcast TDS sensor pada window data sehat (Tabel 5.26 laporan).
              </caption>
              <thead>
                <tr>
                  <th scope="col">Model</th>
                  <th scope="col">Masukan</th>
                  <th scope="col">MAE</th>
                  <th scope="col">Proporsi error di bawah 0,5</th>
                </tr>
              </thead>
              <tbody>
                {control.map((row) => (
                  <tr key={`${row.model}-${row.input}`}>
                    <th scope="row">{row.model}</th>
                    <td>{row.input}</td>
                    <td>{row.mae}</td>
                    <td>{row.proportion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Pada target yang sinyalnya kuat, pipeline yang sama menghasilkan estimasi dengan proporsi error di bawah 0,5 mencapai 97,4%.
            Hasil ini menunjukkan bahwa keterbatasan pada Dryness Prediction dan NCG Prediction berasal dari ketersediaan data, baik jumlah
            sampel laboratorium berlabel maupun kekuatan sinyal parameter masukan, bukan dari pilihan arsitektur model.
          </p>
          <p>
            Penambahan volume data TDS dari sensor baru karena itu tidak memperbaiki akurasi model, sebab yang bertambah adalah ketersediaan
            masukan secara waktu nyata, bukan jumlah sampel laboratorium berlabel yang diperlukan untuk melatih dan mengevaluasi model.
          </p>
        </section>

        <section id="kesimpulan" className={prose.prose}>
          <h2>Kesimpulan</h2>
          <p>
            Modul sensor virtual berbasis LSTM telah terimplementasi dan berjalan pada data operasi, dengan pipeline pengondisian data,
            quantile mapping TDS, serta pencatatan status kalibrasi pada setiap baris keluaran. Namun, validasi terhadap 44 sampel
            laboratorium menunjukkan estimasi yang dihasilkan belum melampaui baseline statistik sederhana.
          </p>
          <p>
            Eksperimen kontrol positif mengonfirmasi bahwa keterbatasan tersebut bersumber pada ukuran sampel berlabel dan kekuatan sinyal
            parameter masukan. Peningkatan akurasi karena itu memerlukan penambahan jumlah sampel laboratorium berlabel, bukan perubahan
            arsitektur model maupun penambahan volume data sensor.
          </p>
          <p>
            Sampai syarat tersebut terpenuhi, keluaran modul ini ditampilkan sebagai informasi penunjang yang disertai status kalibrasi, dan
            sampling laboratorium tetap menjadi acuan untuk keputusan operasi. Pendekatan kuantifikasi ketidakpastian melalui Monte Carlo
            dropout dapat dipertimbangkan untuk menyajikan rentang kepercayaan estimasi secara eksplisit pada pengembangan berikutnya.
            <Citation num={5} />
            <Citation num={6} />
          </p>
        </section>

        <References entries={references} />
      </ArticleBody>
    </ArticleLayout>
  );
}
