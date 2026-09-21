import ncgCompositionChart from 'assets/images/articles/ncg/ncg_composition_chart.jpg';
import turbineCorrosionNcg from 'assets/images/articles/ncg/turbine_corrosion_ncg.jpg';
import abatementSystem from 'assets/images/articles/ncg/abatement_system.jpg';
import ncgEfficiencyImpact from 'assets/images/articles/ncg/ncg_efficiency_impact.jpg';

import ArticleBody from 'components/landing/article/ArticleBody';
import ArticleLayout from 'components/landing/article/ArticleLayout';
import Callout from 'components/landing/article/Callout';
import Citation from 'components/landing/article/Citation';
import Figure from 'components/landing/article/Figure';
import References from 'components/landing/article/References';
import prose from 'components/landing/article/Prose.module.css';

const sections = [
  { id: 'pendahuluan', label: 'Pendahuluan' },
  { id: 'komposisi', label: 'Komposisi NCG' },
  { id: 'dampak', label: 'Dampak operasional' },
  { id: 'studi', label: 'Studi lapangan' },
  { id: 'teknologi', label: 'Teknologi pengendalian' },
  { id: 'kesimpulan', label: 'Kesimpulan' },
  { id: 'dafpus', label: 'Daftar pustaka' }
];

const composition = [
  { gas: 'CO₂ (karbon dioksida)', share: '85 sampai 95%' },
  { gas: 'H₂S (hidrogen sulfida)', share: '1 sampai 3%' },
  { gas: 'NH₃ (amonia)', share: 'sekitar 0,1%' },
  { gas: 'Gas lain (N₂, CH₄, Ar, H₂)', share: '1 sampai 5%' }
];

const impact = [
  { content: '5%', loss: '4 sampai 5%' },
  { content: '10%', loss: '8 sampai 10%' },
  { content: '25%', loss: 'hingga 22%' }
];

const references = [
  {
    author: 'Gokcen, G., Yıldırım, N.',
    title: 'Effect of Non-Condensable Gases on geothermal power plant performance',
    source: 'Semantic Scholar',
    year: 2016
  },
  { author: 'Cengic, I., Soldo, V.', title: 'Environmental Impact of Geothermal Power Plants', source: 'Hrcak Journal', year: 2018 },
  {
    author: 'ThinkGeoEnergy.',
    title: 'Treating non-condensable gases (NCG) of geothermal plants: experience by Mannvit',
    source: 'ThinkGeoEnergy',
    year: 2019
  },
  {
    author: '',
    title: 'Possibilities Study of a Non-condensable Gas Exhaust System',
    source: 'Journal of Geoscience, Engineering, Environment, and Technology (JGEET)',
    year: 2024
  },
  {
    author: 'World Bank ESMAP.',
    title: 'Geothermal handbook: Planning and financing power generation',
    source: 'ESMAP Technical Report',
    year: 2012
  },
  { author: '', title: 'Journal of Geoscience, Engineering, Environment, and Technology', source: 'JGEET UIR, Vol. 9', year: 2024 },
  {
    author: 'JICA.',
    title: 'Preparatory Survey for Lumut Balai Geothermal Project in the Republic of Indonesia',
    source: 'JICA Report',
    year: 2012
  },
  {
    author: 'Nogara, J. dkk.',
    title: 'The influence of non-condensable gases on the net work produced by a geothermal power plant',
    source: 'Applied Energy',
    year: 1982
  },
  { author: 'EPRI.', title: 'Corrosion of Materials Used in Geothermal Power Production', source: 'EPRI Technical Report', year: 2016 },
  {
    author: 'Nogara, J., Zarrouk, S. J.',
    title: 'Corrosion in geothermal environment: Part 1',
    source: 'Renewable and Sustainable Energy Reviews',
    year: 2018
  },
  { author: 'EPRI.', title: 'Materials Degradation and Failure Mechanisms in Geothermal Power Systems', source: 'EPRI Report', year: 2016 },
  { author: 'Bertani, R., Thain, I.', title: 'Geothermal power generating plant CO₂ emission survey', source: 'IGA News', year: 2002 },
  {
    author: 'Bloomfield, K. K., Moore, J. N., Neilson, R. M.',
    title: 'Geothermal Energy Reduces Greenhouse Gases',
    source: 'Geothermal Resources Council Bulletin',
    year: 2003
  },
  { author: 'Putra, A. D.', title: 'Analisis Dispersi H₂S dan NH₃ dari PLTP Kamojang', source: 'Digital Library ITB', year: 2016 },
  {
    author: 'PT SMI.',
    title: 'Environmental and Social Impact Assessment: Waesano GEUDP Project',
    source: 'PT SMI Documentation',
    year: 2019
  },
  {
    author: 'Star Energy Geothermal.',
    title: 'Wayang Windu Sustainability Report 2016',
    source: 'Star Energy Corporate Report',
    year: 2016
  },
  {
    author: 'Kilgour, G. dkk.',
    title: 'Non-condensable gas reinjection at the Te Huka geothermal power plant',
    source: 'Geothermal Resources Council Transactions',
    year: 2016
  },
  {
    author: 'McNamara, D. D. dkk.',
    title: 'Non Condensable Gas Reinjection Trial at Ngatamariki Geothermal Field',
    source: 'New Zealand Geothermal Workshop',
    year: 2022
  },
  {
    author: 'Sterzinger, G., Taylor, M.',
    title: 'Sustainable removal of non-condensable gases from geothermal plants',
    source: 'Renewable and Sustainable Energy Reviews',
    year: 2013
  },
  { author: 'KROHNE.', title: 'Gas analysis systems for geothermal power generation', source: 'KROHNE Technical Documentation', year: 2020 }
];

// ==============================|| ARTICLE - NCG ||============================== //

export default function NCGArticle() {
  return (
    <ArticleLayout
      eyebrow="Parameter uap"
      title="Non Condensable Gas (NCG)"
      lead="Pengaruh gas yang tidak terkondensasi terhadap kinerja kondensor, laju korosi material, dan emisi pembangkit."
    >
      <ArticleBody sections={sections}>
        <section id="pendahuluan" className={prose.prose}>
          <h2>Gas yang tidak terkondensasi dalam aliran uap</h2>
          <p>
            Parameter operasi seperti tekanan, temperatur, dan laju alir dapat berada dalam rentang normal sementara kinerja unit menurun.
            Salah satu penyebabnya adalah <strong>Non Condensable Gas (NCG)</strong>, yaitu gas yang mengalir bersama uap tetapi tidak
            terkondensasi pada kondisi kerja kondensor.
            <Citation num={1} />
          </p>
          <p>
            Studi eksperimental menunjukkan bahwa kenaikan kandungan NCG sebesar 1% menurunkan daya turbin hingga 0,86%. Pada kandungan NCG
            sebesar 25%, penurunan efisiensi total mencapai 22%, yang pada unit berkapasitas 110 MW setara dengan kehilangan keluaran
            sekitar 24 MW.
            <Citation num={2} />
          </p>

          <Callout label="Definisi">
            <p>
              NCG adalah gas yang tidak dapat dikondensasikan pada tekanan dan temperatur kerja kondensor. Berbeda dengan uap air yang
              berubah menjadi kondensat, NCG tetap berada dalam fase gas dan terakumulasi di dalam sistem. Akumulasi tersebut membentuk
              lapisan penghambat perpindahan panas dan menurunkan derajat vakum kondensor.
            </p>
          </Callout>
        </section>

        <section id="komposisi" className={prose.prose}>
          <h2>Komposisi NCG</h2>
          <p>
            NCG pada PLTP berasal dari fluida geotermal yang terperangkap dalam reservoir. Komposisinya bervariasi mengikuti karakteristik
            reservoir, dengan proporsi tipikal sebagai berikut.
            <Citation num={3} />
            <Citation num={4} />
          </p>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 1. Komposisi tipikal NCG pada PLTP di Indonesia.</caption>
              <thead>
                <tr>
                  <th scope="col">Komponen</th>
                  <th scope="col">Proporsi</th>
                </tr>
              </thead>
              <tbody>
                {composition.map((row) => (
                  <tr key={row.gas}>
                    <th scope="row">{row.gas}</th>
                    <td>{row.share}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Meskipun CO<sub>2</sub> mendominasi secara kuantitas, H<sub>2</sub>S dengan proporsi 1 sampai 3% merupakan komponen yang paling
            kritis karena bersifat sangat korosif terhadap logam sekaligus toksik. Pada konsentrasi tinggi, gas ini melumpuhkan indra
            penciuman sehingga keberadaannya tidak lagi terdeteksi secara sensorik.
            <Citation num={5} />
          </p>

          <Figure
            src={ncgCompositionChart}
            alt="Diagram komposisi NCG pada beberapa lapangan panas bumi"
            caption="Gambar 1. Variasi komposisi NCG pada beberapa lapangan panas bumi."
          />
        </section>

        <section id="dampak" className={prose.prose}>
          <h2>Tiga dampak operasional</h2>

          <h3>Penurunan efisiensi melalui efek selimut termal</h3>
          <p>
            NCG membentuk lapisan penghambat pada permukaan kondensor yang menghalangi perpindahan panas dari uap ke air pendingin.
            Mekanismenya berlangsung melalui empat jalur.
            <Citation num={6} />
          </p>
          <ul>
            <li>
              <strong>Sifat inert.</strong> NCG tidak menghasilkan kerja ketika melewati turbin, tetapi tetap terbawa dalam aliran uap.
            </li>
            <li>
              <strong>Penurunan tekanan parsial uap.</strong> Keberadaan NCG menurunkan tekanan parsial uap di kondensor sehingga tekanan
              balik turbin meningkat.
            </li>
            <li>
              <strong>Hambatan kondensasi.</strong> Lapisan NCG pada tube kondensor berperan sebagai isolator yang memperlambat perpindahan
              panas.
            </li>
            <li>
              <strong>Degradasi vakum.</strong> Akumulasi NCG menurunkan derajat vakum kondensor sehingga gaya dorong ekspansi uap pada
              turbin berkurang.
              <Citation num={7} />
            </li>
          </ul>

          <div className={prose.tableWrap}>
            <table className={prose.table}>
              <caption className={prose.caption}>Tabel 2. Hubungan kandungan NCG terhadap penurunan efisiensi turbin.</caption>
              <thead>
                <tr>
                  <th scope="col">Kandungan NCG</th>
                  <th scope="col">Penurunan efisiensi</th>
                </tr>
              </thead>
              <tbody>
                {impact.map((row) => (
                  <tr key={row.content}>
                    <th scope="row">{row.content}</th>
                    <td>{row.loss}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Hubungan antara kandungan NCG dan penurunan efisiensi bersifat nonlinear, sehingga kenaikan kandungan pada rentang tinggi
            memberikan dampak yang jauh lebih besar daripada pada rentang rendah.
            <Citation num={2} />
          </p>

          <h3>Akselerasi korosi</h3>
          <p>
            H<sub>2</sub>S dan CO<sub>2</sub> merupakan agen korosif yang agresif, terutama pada temperatur tinggi dan kondisi basah.
            <Citation num={8} />
          </p>
          <ul>
            <li>
              <strong>
                Korosi oleh H<sub>2</sub>S.
              </strong>{' '}
              Gas ini bereaksi dengan baja membentuk iron sulfide yang rapuh dan merusak struktur kristal logam. Pada konsentrasi tinggi
              dapat terjadi <em>hydrogen embrittlement</em>, yaitu logam menjadi getas dan mudah retak.
              <Citation num={9} />
            </li>
            <li>
              <strong>
                Korosi oleh CO<sub>2</sub>.
              </strong>{' '}
              Gas ini larut dalam kondensat membentuk asam karbonat yang menurunkan pH hingga 3 sampai 4. Pada pH rendah, laju korosi
              meningkat secara eksponensial.
              <Citation num={10} />
            </li>
            <li>
              <strong>Efek sinergis.</strong> Kombinasi H<sub>2</sub>S, CO<sub>2</sub>, dan O<sub>2</sub> pada kondisi basah menghasilkan
              lingkungan yang jauh lebih korosif daripada masing-masing gas secara terpisah, dengan bentuk kerusakan berupa pitting,
              perambatan retak, dan pengelupasan material.
              <Citation num={11} />
            </li>
          </ul>

          <Callout label="Konsekuensi" tone="warning">
            <p>
              Korosi internal akibat NCG dapat berlangsung pada sudu turbin yang secara visual masih tampak normal. Kegagalan sudu yang
              terjadi mendadak saat operasi menimbulkan penghentian tidak terencana serta kerusakan sekunder pada komponen turbin lainnya.
            </p>
          </Callout>

          <h3>Dampak lingkungan</h3>
          <p>
            NCG yang tidak dikelola menjadi sumber emisi gas rumah kaca dan polutan udara.
            <Citation num={12} />
          </p>
          <ul>
            <li>
              <strong>
                Emisi CO<sub>2</sub>.
              </strong>{' '}
              Meskipun PLTP lebih bersih dibandingkan pembangkit berbahan bakar fosil, emisi CO<sub>2</sub> dari NCG berkisar 50 sampai 200
              g CO<sub>2</sub> per kWh bergantung pada kandungan NCG reservoir.
              <Citation num={13} />
            </li>
            <li>
              <strong>
                Emisi H<sub>2</sub>S.
              </strong>{' '}
              Gas ini bersifat toksik dan berdampak pada kesehatan masyarakat sekitar. WHO menetapkan batas paparan jangka panjang sebesar
              0,005 ppm, sehingga banyak unit memerlukan scrubber dan stasiun pemantauan emisi.
              <Citation num={14} />
            </li>
            <li>
              <strong>Kepatuhan regulasi.</strong> Indonesia menerapkan regulasi emisi untuk PLTP, dan pelanggaran dapat berakibat pada
              sanksi administratif hingga penghentian operasi.
              <Citation num={15} />
            </li>
          </ul>

          <Figure
            src={turbineCorrosionNcg}
            alt="Korosi dan pitting pada sudu turbin akibat NCG"
            caption="Gambar 2. Korosi mikro dan pitting pada sudu turbin akibat paparan NCG."
          />
        </section>

        <section id="studi" className={prose.prose}>
          <h2>Studi lapangan</h2>

          <h3>PLTP Wayang Windu, Jawa Barat, 227 MW</h3>
          <p>
            Unit ini menghadapi kandungan NCG sebesar 1,0 sampai 1,2% dari total uap. Sistem gas removal dengan ejektor vakum digunakan
            untuk mengekstraksi NCG dari kondensor, dan sebagian direinjeksikan ke reservoir bersama brine. Emisi H<sub>2</sub>S turun
            hingga 95%, efisiensi turbin meningkat 3 sampai 4%, dan kepatuhan terhadap regulasi lingkungan terpenuhi.
            <Citation num={3} />
            <Citation num={16} />
          </p>

          <h3>PLTP Kamojang, Jawa Barat, 235 MW</h3>
          <p>
            Studi dispersi emisi H<sub>2</sub>S dan NH<sub>3</sub> menunjukkan bahwa tanpa sistem abatement yang memadai, konsentrasi H
            <sub>2</sub>S di area permukiman sekitar dapat melampaui batas WHO. Penerapan scrubber H<sub>2</sub>S berbasis caustic soda
            menurunkan emisi hingga memenuhi standar nasional, dengan pemantauan kontinu menggunakan sensor elektrokimia.
            <Citation num={14} />
          </p>

          <h3>PLTP Te Huka, Selandia Baru</h3>
          <p>
            Unit ini menerapkan reinjeksi NCG secara menyeluruh, yaitu seluruh NCG yang diekstraksi dari kondensor direinjeksikan ke
            reservoir dalam bentuk terlarut bersama kondensat. Emisi CO<sub>2</sub> dan H<sub>2</sub>S menurun hingga mendekati nol, tekanan
            reservoir terjaga, dan tidak ditemukan permasalahan korosi setelah lebih dari lima tahun operasi.
            <Citation num={17} />
          </p>

          <h3>PLTP Ngatamariki, Selandia Baru</h3>
          <p>
            Uji coba reinjeksi NCG dengan pemantauan corrosion coupon selama 12 bulan menunjukkan laju korosi yang rendah, yaitu 0,1 sampai
            0,3 mm per tahun, dengan scaling terbatas pada senyawa antimon dan arsenik yang dapat dikendalikan melalui perlakuan kimia.
            <Citation num={18} />
          </p>

          <Figure
            src={ncgEfficiencyImpact}
            alt="Grafik hubungan kandungan NCG dan efisiensi turbin"
            caption="Gambar 3. Hubungan nonlinear antara kandungan NCG dan penurunan efisiensi turbin."
          />
        </section>

        <section id="teknologi" className={prose.prose}>
          <h2>Teknologi pengendalian</h2>
          <p>Pengelolaan NCG memerlukan sistem terintegrasi yang mencakup ekstraksi, pengolahan, serta pembuangan atau reinjeksi.</p>

          <h3>Sistem ekstraksi</h3>
          <p>
            <strong>Steam jet ejector.</strong> Memanfaatkan uap bertekanan tinggi untuk membentuk vakum yang mengekstraksi NCG dari
            kondensor. Ejektor bertingkat tiga hingga empat dapat menurunkan tekanan kondensor hingga 0,1 bar absolut. Keunggulannya adalah
            ketiadaan komponen bergerak sehingga kebutuhan pemeliharaannya rendah.
            <Citation num={19} />
          </p>
          <p>
            <strong>Liquid ring vacuum pump.</strong> Alternatif ekstraksi mekanis dengan efisiensi lebih tinggi untuk kandungan NCG di atas
            5%. Konsekuensinya adalah biaya kapital dan pemeliharaan yang lebih tinggi, dengan konsumsi listrik yang lebih rendah
            dibandingkan ejektor.
            <Citation num={6} />
          </p>

          <h3>
            Sistem abatement H<sub>2</sub>S
          </h3>
          <p>
            <strong>Caustic scrubbing.</strong> NCG dialirkan melalui packed tower dengan semprotan natrium hidroksida yang menyerap H
            <sub>2</sub>S membentuk natrium sulfida. Efisiensi penyisihannya melampaui 95%.
            <Citation num={3} />
          </p>
          <p>
            <strong>Proses SulfaTreat.</strong> Menggunakan bed iron oxide untuk menyerap H<sub>2</sub>S. Pengoperasiannya lebih sederhana
            dan tidak menghasilkan limbah cair, tetapi memerlukan regenerasi atau penggantian bed secara periodik, sehingga sesuai untuk
            kandungan H<sub>2</sub>S di bawah 100 ppm.
          </p>

          <h3>Reinjeksi NCG</h3>
          <ol>
            <li>
              <strong>Pelarutan dalam kondensat.</strong> NCG dilarutkan dalam kondensat pada tekanan 20 sampai 40 bar sebelum diinjeksikan.
            </li>
            <li>
              <strong>Sumur reinjeksi.</strong> Kondensat beserta NCG terlarut diinjeksikan melalui sumur periferal untuk menjaga tekanan
              reservoir.
            </li>
            <li>
              <strong>Penurunan emisi.</strong> Dengan reinjeksi menyeluruh, emisi CO<sub>2</sub> dan H<sub>2</sub>S dapat ditekan hingga
              mendekati nol.
              <Citation num={17} />
            </li>
          </ol>

          <h3>Sistem pemantauan</h3>
          <p>
            <strong>Analyzer gas daring.</strong> Pemantauan kontinu komposisi NCG menggunakan kromatografi gas atau analyzer inframerah,
            dengan data waktu nyata untuk mengoptimalkan proses ekstraksi dan pengolahan.
            <Citation num={20} />
          </p>
          <p>
            <strong>Corrosion coupon dan sensor.</strong> Pemantauan laju korosi pada lokasi kritis seperti tube kondensor, perpipaan, dan
            turbin, sehingga degradasi material terdeteksi sebelum menimbulkan kegagalan.
          </p>

          <Figure
            src={abatementSystem}
            alt="Skema sistem ekstraksi, abatement, dan reinjeksi NCG"
            caption="Gambar 4. Skema sistem ekstraksi, abatement, dan reinjeksi NCG."
          />
        </section>

        <section id="kesimpulan" className={prose.prose}>
          <h2>Kesimpulan</h2>
          <p>
            NCG merupakan bagian inheren dari operasi PLTP yang tidak dapat dihilangkan, tetapi dapat dikelola. Dampaknya mencakup penurunan
            efisiensi hingga 22%, percepatan korosi pada material turbin, serta konsekuensi lingkungan apabila tidak ditangani.
          </p>
          <p>
            Pengalaman operasi di Indonesia maupun internasional menunjukkan bahwa pengelolaan NCG secara terintegrasi, mulai dari ekstraksi
            hingga reinjeksi, tidak hanya memenuhi ketentuan regulasi tetapi juga memberikan manfaat berupa kenaikan efisiensi, penurunan
            biaya pemeliharaan, dan perpanjangan umur pakai turbin.
          </p>

          <Callout label="Poin utama">
            <ul>
              <li>Pemantauan komposisi NCG dan tekanan kondensor secara kontinu merupakan dasar bagi deteksi dini.</li>
              <li>Sistem ekstraksi bertingkat atau kombinasi ejektor dan pompa memberikan efisiensi penyisihan yang optimal.</li>
              <li>
                Abatement H<sub>2</sub>S diperlukan untuk memenuhi ketentuan emisi yang berlaku.
              </li>
              <li>Reinjeksi NCG terbukti dapat menekan emisi hingga mendekati nol tanpa menimbulkan masalah korosi jangka panjang.</li>
              <li>Program pengelolaan korosi berupa inspeksi berkala dan pemantauan coupon diperlukan pada area berisiko tinggi.</li>
            </ul>
          </Callout>
        </section>

        <References entries={references} />
      </ArticleBody>
    </ArticleLayout>
  );
}
