"""Bygger ortssidorna (fonsterputs-<ort>.html) och sitemap.xml.

Kör efter ändringar i texterna eller priserna nedan:
    python3 _bygg/orter.py
Mappar som börjar med _ publiceras inte av GitHub Pages.
"""
import datetime, html, json, pathlib

ROT = pathlib.Path(__file__).resolve().parent.parent
IDAG = datetime.date.today().isoformat()
BAS = 'https://fenstrofonster.se/'

# Varje ort: filnamn, namn, rubrik, ingress, stycken och frågor.
# Texterna ska skilja sig åt på riktigt – kopierad text hjälper inte i Google.
ORTER = [
    {
        'fil': 'fonsterputs-hollviken.html',
        'namn': 'Höllviken',
        'kort': 'Höllviken',
        'ingress': 'Vi bor i Vellinge kommun och putsar fönster i Höllviken till fast pris. Från 250 kr efter RUT-avdrag, och resan kostar inget.',
        'text': [
            'Höllviken ligger precis vid havet, och det märks på fönstren. Salt och sand fastnar på glaset, särskilt efter blåsiga dagar, och fönstren blir grå fortare än längre in i landet.',
            'Därför brukar det vara värt att putsa utsidan tre till fyra gånger om året här. Det är precis vad vårt abonnemang Fräscha Fönster gör: vi kommer i april, juni, september och december, och du betalar 200 kr per gång efter RUT. Ingen bindningstid.',
            'Vill du hellre boka en gång i taget går det lika bra. Räkna ut priset på startsidan och skicka en förfrågan, så hör vi av oss och bokar en tid.',
        ],
        'fragor': [
            ('Hur ofta ska man putsa fönster i Höllviken?', 'Nära havet blir fönstren smutsiga snabbare av salt och sand. Därför brukar det vara värt att putsa utsidan tre till fyra gånger om året.'),
            ('Kostar det extra att ni kommer till Höllviken?', 'Nej. Vi tar ingen resekostnad eller startavgift. Du betalar bara priset för putsningen.'),
        ],
    },
    {
        'fil': 'fonsterputs-skanor-falsterbo.html',
        'namn': 'Skanör och Falsterbo',
        'kort': 'Skanör',
        'ingress': 'Fönsterputs i Skanör och Falsterbo till fast pris. Från 250 kr efter RUT-avdrag, utan resekostnad eller andra tillägg.',
        'text': [
            'Skanör och Falsterbo har havet på flera sidor. Vinden tar med sig salt och sand som lägger sig på glaset, så fönstren behöver putsas oftare här än på många andra ställen.',
            'Har du fönster med spröjs kostar det inget extra. Vill du att vi också tvättar spröjsen och ramarna runt glaset kostar det 10 kr per fönster. Har du kopplade fönster som går att öppna isär kan vi putsa mellan glasen också. Då tittar vi först, på bilder eller på plats, och bedömningen är gratis.',
            'Vi är från Vellinge kommun och putsar själva. Du vet vilka som kommer, och priset du ser när du bokar är priset du betalar.',
        ],
        'fragor': [
            ('Putsar ni spröjsade fönster i Skanör och Falsterbo?', 'Ja. Ett fönster med spröjs kostar inget extra. Vill du att vi också tvättar spröjsen och ramarna kostar det 10 kr per fönster.'),
            ('Kan ni putsa mellan glasen?', 'Ja, på fönster som går att öppna isär. Vi gör en gratis bedömning först, och du får ett fast pris innan vi börjar.'),
        ],
    },
    {
        'fil': 'fonsterputs-ljunghusen.html',
        'namn': 'Ljunghusen',
        'kort': 'Ljunghusen',
        'ingress': 'Vi putsar fönster i Ljunghusen till fast pris. Från 250 kr efter RUT-avdrag, och vi tar ingen resekostnad.',
        'text': [
            'Ljunghusen ligger mellan Höllviken och Falsterbo, nära havet. Precis som i resten av Falsterbonäset blir fönstren smutsiga ganska fort av salt och sand.',
            'Har du fönster på övervåningen går det också bra. Fönster på övervåningen kostar 100 kr extra för utvändig putsning och 200 kr för in- och utvändig. Är något svårt att nå gör vi en gratis bedömning innan vi sätter pris. Ofta räcker det att du skickar bilder.',
            'Fönsterblecken torkar vi utan extra kostnad, och fönsterbågarna räknar vi så här: varje båge som går att öppna är ett fönster, en fast ruta är ett fönster och en glasdörr är ett fönster.',
        ],
        'fragor': [
            ('Vad kostar fönsterputs i Ljunghusen?', 'Utvändig putsning av upp till 20 fönster kostar 250 kr efter RUT-avdrag. In- och utvändigt kostar 500 kr efter RUT. Övervåning kostar 100 kr extra utvändigt och 200 kr extra in- och utvändigt.'),
            ('Vad händer om ett fönster är svårt att nå?', 'Då gör vi en gratis bedömning innan vi sätter pris, ofta på bilder du skickar. Är något för riskabelt säger vi det hellre direkt.'),
        ],
    },
    {
        'fil': 'fonsterputs-malmo.html',
        'namn': 'Malmö',
        'kort': 'Malmö',
        'ingress': 'Fönsterputs i Malmö för villor, radhus och företag. Fast pris från 250 kr efter RUT-avdrag, och resan från Vellinge kostar inget.',
        'text': [
            'Vi utgår från Vellinge men putsar fönster i Malmö också. Priset är detsamma som hemma i Vellinge kommun. Vi tar ingen resekostnad och ingen startavgift.',
            'För privatpersoner gäller RUT-avdraget, så du betalar halva priset och vi sköter ansökan hos Skatteverket. Upp till 20 fönster utvändigt kostar 250 kr efter RUT och in- och utvändigt 500 kr.',
            'Har du en butik, ett kontor eller en restaurang putsar vi gärna där också. In- och utvändigt kostar 1 000 kr för upp till 20 fönster, ingen moms tillkommer och du får faktura. Vill du ha regelbunden putsning gör vi ett eget pris utan startavgift och utan bindningstid.',
        ],
        'fragor': [
            ('Putsar ni fönster åt företag i Malmö?', 'Ja. In- och utvändigt kostar 1 000 kr för upp till 20 fönster, ingen moms tillkommer och du får faktura. Regelbunden putsning får ett eget pris.'),
            ('Kostar det mer att ni kommer till Malmö?', 'Nej. Priset är detsamma i hela området och vi tar ingen resekostnad.'),
        ],
    },
    {
        'fil': 'fonsterputs-trelleborg.html',
        'namn': 'Trelleborg',
        'kort': 'Trelleborg',
        'ingress': 'Vi putsar fönster i Trelleborg till fast pris. Från 250 kr efter RUT-avdrag, utan resekostnad.',
        'text': [
            'Trelleborg ligger vid kusten, och fönster nära havet blir smutsiga fortare av salt och sand. Bor du nära vattnet kan det vara värt att putsa utsidan tre till fyra gånger om året.',
            'Med abonnemanget Fräscha Fönster putsar vi utsidan i april, juni, september och december för 200 kr per gång efter RUT. Vi hör av oss inför varje gång, och det finns ingen bindningstid.',
            'Vill du bara ha en putsning går det också bra. Räkna ut priset på startsidan och skicka en förfrågan. Bokningen blir inte bindande förrän vi har kommit överens om en tid.',
        ],
        'fragor': [
            ('Vad kostar fönsterputs i Trelleborg?', 'Utvändig putsning av upp till 20 fönster kostar 250 kr efter RUT-avdrag, och in- och utvändigt kostar 500 kr. Vi tar ingen resekostnad.'),
            ('Har ni abonnemang i Trelleborg?', 'Ja. Fräscha Fönster ger utvändig putsning fyra gånger om året för 200 kr per gång efter RUT, utan bindningstid.'),
        ],
    },
    {
        'fil': 'fonsterputs-svedala.html',
        'namn': 'Svedala',
        'kort': 'Svedala',
        'ingress': 'Fönsterputs i Svedala till fast pris. Från 250 kr efter RUT-avdrag, och resan kostar inget.',
        'text': [
            'Svedala ligger en bit från havet, så fönstren blir inte lika fort smutsiga av salt som ute vid kusten. Här räcker det ofta att putsa två gånger om året, på våren och på hösten.',
            'Vi putsar både utvändigt och in- och utvändigt. Före en invändig putsning behöver du bara ta bort saker från fönsterbrädorna så att vi kommer åt. Fönsterblecken torkar vi utan extra kostnad.',
            'Priset är detsamma som i Vellinge kommun. Ingen resekostnad, ingen startavgift och inga tillägg på plats.',
        ],
        'fragor': [
            ('Hur ofta ska man putsa fönster i Svedala?', 'En bit från havet räcker det ofta med två gånger om året, på våren och på hösten.'),
            ('Kostar det extra att ni kommer till Svedala?', 'Nej. Vi tar ingen resekostnad eller startavgift.'),
        ],
    },
]

CSS = '''@font-face{font-family:"Montserrat";src:url("fonts/montserrat.woff2") format("woff2");font-weight:100 900;font-display:swap}
:root{--ink:#0F2A4A;--ink-2:#173a63;--glas:#5FA8D3;--glas-d:#3a87b8;--frost:#BFD6E8;--is:#F3F6F9;--skiffer:#5A6B7C;--linje:#D5DEE7}
*{box-sizing:border-box}
body{margin:0;font-family:"Montserrat",system-ui,sans-serif;font-size:17px;line-height:1.6;color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%;height:auto}
h1,h2,h3{line-height:1.1;margin:0;letter-spacing:-.025em}
.wrap{max-width:1180px;margin:0 auto;padding:0 clamp(20px,4vw,40px)}
.top{border-bottom:1px solid var(--linje)}
.top__in{display:flex;align-items:center;justify-content:space-between;gap:16px;height:76px}
.top img{height:38px;width:auto}
.btn{display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;text-decoration:none;padding:12px 22px;border-radius:999px;border:2px solid var(--ink);background:var(--ink);color:#fff;transition:background .15s,border-color .15s}
.btn:hover{background:var(--ink-2);border-color:var(--ink-2)}
.btn--ghost{background:transparent;color:var(--ink)}
.btn--ghost:hover{background:var(--ink);color:#fff}
.crumbs{font-size:14px;color:var(--skiffer);padding-top:20px}
.crumbs a{color:var(--skiffer)}
.head{padding-top:clamp(28px,5vw,56px);padding-bottom:clamp(28px,4vw,40px)}
h1{font-size:clamp(38px,5.5vw,60px)}
.lead{font-size:clamp(18px,1.6vw,20px);color:var(--skiffer);max-width:34em;margin:16px 0 0}
.row{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.body{display:grid;grid-template-columns:1.2fr .8fr;gap:clamp(32px,6vw,80px);padding-bottom:clamp(48px,7vw,88px)}
.body p+p{margin-top:16px}
.body h2{font-size:clamp(26px,3vw,34px);margin-bottom:18px}
.prices{background:var(--is);border-radius:20px;padding:28px;align-self:start}
.prices h2{font-size:22px}
.prices ul{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.prices li{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid var(--linje);padding-bottom:12px}
.prices li:last-child{border-bottom:0;padding-bottom:0}
.prices li b{white-space:nowrap}
.prices p{font-size:14px;color:var(--skiffer);margin-top:16px}
.faq{background:var(--is);padding:clamp(48px,7vw,80px) 0}
.faq h2{font-size:clamp(26px,3vw,34px);margin-bottom:12px}
.faq details{border-bottom:1px solid var(--linje);max-width:820px}
.faq summary{cursor:pointer;padding:20px 0;font-weight:700;font-size:18px}
.faq details p{margin:0;padding:0 0 20px;color:var(--skiffer);max-width:44em}
.more{padding-top:clamp(40px,6vw,64px);padding-bottom:clamp(40px,6vw,64px)}
.more h2{font-size:22px;margin-bottom:16px}
.more ul{display:flex;flex-wrap:wrap;gap:10px;margin:0;padding:0;list-style:none}
.more a{display:block;padding:10px 18px;border-radius:999px;border:1px solid var(--linje);font-weight:600;font-size:15px;text-decoration:none;color:var(--ink)}
.more a:hover{border-color:var(--glas)}
.cta{background:var(--ink);color:#fff;padding:clamp(48px,7vw,80px) 0}
.cta h2{font-size:clamp(28px,3.6vw,40px)}
.cta p{color:var(--frost);margin:12px 0 0;max-width:32em}
.cta .btn{background:var(--glas);border-color:var(--glas);color:var(--ink)}
.cta .btn:hover{background:var(--frost);border-color:var(--frost)}
.cta .btn--ghost{background:transparent;border-color:#bfd6e866;color:#fff}
.cta .btn--ghost:hover{background:#bfd6e81f;border-color:var(--frost)}
.foot{background:#0b2240;color:var(--frost);font-size:14px;padding:28px 0}
.foot a{color:#fff}
:focus-visible{outline:3px solid var(--glas);outline-offset:3px;border-radius:8px}
@media(max-width:860px){.body{grid-template-columns:1fr}}
@media(max-width:520px){.top .btn{padding:10px 16px;font-size:14px}}'''


def e(t):
    return html.escape(t, quote=True)


def sida(o):
    url = BAS + o['fil']
    titel = f"Fönsterputs i {o['namn']} – fast pris från 250 kr | Fenstro Fönster"
    besk = o['ingress']
    schema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Service',
                'name': f"Fönsterputs i {o['namn']}",
                'serviceType': 'Fönsterputs',
                'url': url,
                'description': besk,
                'provider': {'@id': BAS + '#foretag'},
                'areaServed': [{'@type': 'City', 'name': n} for n in o['namn'].split(' och ')],
                'offers': {'@type': 'Offer', 'price': '250', 'priceCurrency': 'SEK',
                           'description': 'Utvändig fönsterputs, upp till 20 fönster, efter RUT-avdrag'},
            },
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    {'@type': 'ListItem', 'position': 1, 'name': 'Fenstro Fönster', 'item': BAS},
                    {'@type': 'ListItem', 'position': 2, 'name': f"Fönsterputs i {o['namn']}", 'item': url},
                ],
            },
        ],
    }
    text = '\n        '.join(f'<p>{e(p)}</p>' for p in o['text'])
    fragor = '\n      '.join(f'<details><summary>{e(q)}</summary><p>{e(a)}</p></details>' for q, a in o['fragor'])
    andra = '\n        '.join(f'<li><a href="{x["fil"]}">Fönsterputs i {e(x["namn"])}</a></li>' for x in ORTER if x is not o)
    return f'''<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(titel)}</title>
<meta name="description" content="{e(besk)}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#0F2A4A">
<meta property="og:type" content="website">
<meta property="og:locale" content="sv_SE">
<meta property="og:title" content="Fönsterputs i {e(o['namn'])} – Fenstro Fönster">
<meta property="og:description" content="{e(besk)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://fenstrofonster.se/img/og.jpg">
<link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="icon" href="/img/ikon.svg" type="image/svg+xml"><link rel="icon" href="/img/ikon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="img/apple-touch-icon.png">
<script type="application/ld+json">
{json.dumps(schema, ensure_ascii=False, indent=2)}
</script>
<style>
{CSS}
</style>
</head>
<body>
<header class="top">
  <div class="wrap top__in">
    <a href="/" aria-label="Till startsidan"><img src="img/logo.svg" alt="Fenstro Fönster" width="300" height="70"></a>
    <a href="/#boka" class="btn">Boka putsning</a>
  </div>
</header>

<main>
  <nav class="wrap crumbs" aria-label="Du är här"><a href="/">Fenstro Fönster</a> › Fönsterputs i {e(o['namn'])}</nav>

  <div class="wrap head">
    <h1>Fönsterputs i {e(o['namn'])}</h1>
    <p class="lead">{e(o['ingress'])}</p>
    <div class="row">
      <a href="/#boka" class="btn">Räkna ut pris och boka</a>
      <a href="/#priser" class="btn btn--ghost">Se alla priser</a>
    </div>
  </div>

  <div class="wrap body">
    <div>
      <h2>Rena fönster i {e(o['kort'])}</h2>
        {text}
    </div>
    <aside class="prices" aria-labelledby="pris-rubrik">
      <h2 id="pris-rubrik">Priser</h2>
      <ul>
        <li><span>Utvändigt, upp till 20 fönster</span><b>250 kr</b></li>
        <li><span>In- och utvändigt, upp till 20 fönster</span><b>500 kr</b></li>
        <li><span>Fräscha Fönster, 4 gånger om året</span><b>200 kr/gång</b></li>
        <li><span>Företag, in- och utvändigt</span><b>1 000 kr</b></li>
      </ul>
      <p>Priserna för privatpersoner gäller efter RUT-avdrag. Ingen resekostnad och inga startavgifter. Företagspriset är utan moms och betalas mot faktura.</p>
    </aside>
  </div>

  <section class="faq" aria-labelledby="faq-rubrik">
    <div class="wrap">
      <h2 id="faq-rubrik">Frågor om fönsterputs i {e(o['kort'])}</h2>
      {fragor}
    </div>
  </section>

  <section class="wrap more" aria-labelledby="fler-rubrik">
    <h2 id="fler-rubrik">Vi putsar också i</h2>
    <ul>
        <li><a href="/">Vellinge</a></li>
        {andra}
    </ul>
  </section>

  <section class="cta">
    <div class="wrap">
      <h2>Boka fönsterputs i {e(o['kort'])}</h2>
      <p>Räkna ut ditt pris direkt på sidan och skicka en förfrågan. Vi hör av oss och bokar en tid som passar dig.</p>
      <div class="row">
        <a href="/#boka" class="btn">Räkna ut pris och boka</a>
        <a href="/#kontakt" class="btn btn--ghost">Ställ en fråga</a>
      </div>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap">Fenstro Handelsbolag, org.nr 969805-0235, Vellinge. <a href="integritet.html">Integritet och cookies</a>. © 2026</div>
</footer>
</body>
</html>
'''


for o in ORTER:
    (ROT / o['fil']).write_text(sida(o))

# Sitemap: startsidan och ortssidorna får dagens datum, övriga sidor behåller sitt.
sidor = [('', IDAG)] + [(o['fil'], IDAG) for o in ORTER] + [('galleri.html', '2026-11-19'), ('integritet.html', '2026-11-14')]
rader = '\n'.join(f'  <url><loc>{BAS}{f}</loc><lastmod>{d}</lastmod></url>' for f, d in sidor)
(ROT / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rader}\n</urlset>\n')
print(f'{len(ORTER)} ortssidor och sitemap.xml klara')
