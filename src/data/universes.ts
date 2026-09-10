import { UniverseDef, UniverseId } from '../types';

export const UNIVERSES: UniverseDef[] = [
  {
    id: 'nifty-50',
    name: 'Nifty 50',
    shortName: 'Nifty 50',
    category: 'Large Cap',
    description: 'Top 50 flagship mega-cap companies representing core Indian industry leaders.',
    stockCount: 50,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'nifty-next-50',
    name: 'Nifty Next 50',
    shortName: 'Next 50',
    category: 'Large Cap',
    description: 'The 51st to 100th largest companies, often referred to as potential Nifty 50 contenders.',
    stockCount: 50,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'nifty-100',
    name: 'Nifty 100',
    shortName: 'Nifty 100',
    category: 'Large Cap',
    description: 'Combined large-cap universe consisting of Nifty 50 and Nifty Next 50.',
    stockCount: 100,
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    id: 'nifty-200',
    name: 'Nifty 200',
    shortName: 'Nifty 200',
    category: 'Broad Market',
    description: 'Nifty 100 large-caps plus the top 100 mid-caps; covers ~85% of market capitalization.',
    stockCount: 200,
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  {
    id: 'nifty-500',
    name: 'Nifty 500',
    shortName: 'Nifty 500',
    category: 'Broad Market',
    description: 'Top 500 companies listed on NSE across Large, Mid, and Small cap tiers.',
    stockCount: 500,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'nifty-midcap-50',
    name: 'Nifty Midcap 50',
    shortName: 'Midcap 50',
    category: 'Mid Cap',
    description: 'Top 50 most liquid and actively traded mid-market capitalization stocks.',
    stockCount: 50,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'nifty-midcap-100',
    name: 'Nifty Midcap 100',
    shortName: 'Midcap 100',
    category: 'Mid Cap',
    description: 'Top 100 companies from the Nifty Midcap 150 index based on full market capitalization.',
    stockCount: 100,
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  {
    id: 'nifty-midcap-150',
    name: 'Nifty Midcap 150',
    shortName: 'Midcap 150',
    category: 'Mid Cap',
    description: 'Comprehensive mid-cap index of 150 companies ranked 101 to 250 by market capitalization.',
    stockCount: 150,
    badgeColor: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  },
  {
    id: 'nifty-smallcap-50',
    name: 'Nifty Smallcap 50',
    shortName: 'Smallcap 50',
    category: 'Small Cap',
    description: 'Top 50 liquid small-cap growth companies selected from Nifty Smallcap 100.',
    stockCount: 50,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'nifty-smallcap-100',
    name: 'Nifty Smallcap 100',
    shortName: 'Smallcap 100',
    category: 'Small Cap',
    description: 'Top 100 companies from Nifty Smallcap 250 index based on market capitalization.',
    stockCount: 100,
    badgeColor: 'bg-pink-50 text-pink-700 border-pink-200',
  },
  {
    id: 'nifty-smallcap-250',
    name: 'Nifty Smallcap 250',
    shortName: 'Smallcap 250',
    category: 'Small Cap',
    description: 'Comprehensive universe of 250 small-cap companies ranked 251 to 500.',
    stockCount: 250,
    badgeColor: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  },
  {
    id: 'nifty-midsmallcap-400',
    name: 'Nifty Midsmallcap 400',
    shortName: 'MidSmall 400',
    category: 'Broad Market',
    description: '400 mid and small cap companies: Nifty Midcap 150 + Nifty Smallcap 250.',
    stockCount: 400,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'nifty-largemidcap-250',
    name: 'Nifty LargeMidcap 250',
    shortName: 'LargeMid 250',
    category: 'Broad Market',
    description: '250 companies combining top 100 large-caps with 150 mid-caps for balanced exposure.',
    stockCount: 250,
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    id: 'nifty-microcap-250',
    name: 'Nifty Microcap 250',
    shortName: 'Microcap 250',
    category: 'Micro Cap',
    description: '250 emerging high-beta microcap companies ranked 501 to 750 by market capitalization.',
    stockCount: 250,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  {
    id: 'nifty-total-market',
    name: 'Nifty Total Market',
    shortName: 'Total Market',
    category: 'Broad Market',
    description: 'Complete 750 stock universe: Nifty 500 plus Nifty Microcap 250.',
    stockCount: 750,
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },
];

export function getUniverseById(id: UniverseId): UniverseDef {
  const found = UNIVERSES.find((u) => u.id === id);
  return found || UNIVERSES[0];
}

// -------------------------------------------------------------
// Core Segment Constituent Sets
// -------------------------------------------------------------

export const SEGMENT_NIFTY_50 = new Set([
  "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "BHARTIARTL.NS", "ICICIBANK.NS", "SBIN.NS", "INFY.NS",
  "LICI.NS", "HINDUNILVR.NS", "ITC.NS", "LT.NS", "BAJFINANCE.NS", "MARUTI.NS", "HCLTECH.NS",
  "ADANIENT.NS", "AXISBANK.NS", "SUNPHARMA.NS", "TATAMOTORS.NS", "M&M.NS", "NTPC.NS",
  "KOTAKBANK.NS", "ONGC.NS", "TITAN.NS", "ULTRACEMCO.NS", "ADANIPORTS.NS", "COALINDIA.NS",
  "POWERGRID.NS", "ASIANPAINT.NS", "BAJAJ-AUTO.NS", "WIPRO.NS", "BAJAJFINSV.NS", "NESTLEIND.NS",
  "TATASTEEL.NS", "JSWSTEEL.NS", "BEL.NS", "TRENT.NS", "GRASIM.NS", "HINDALCO.NS", "LTIM.NS",
  "SBILIFE.NS", "BPCL.NS", "EICHERMOT.NS", "CIPLA.NS", "DRREDDY.NS", "BRITANNIA.NS",
  "APOLLOHOSP.NS", "SHRIRAMFIN.NS", "HEROMOTOCO.NS", "TATACONSUM.NS", "INDUSINDBK.NS"
]);

export const SEGMENT_NIFTY_NEXT_50 = new Set([
  "HAL.NS", "DMART.NS", "ADANIPOWER.NS", "ADANIGREEN.NS", "SIEMENS.NS", "IOC.NS", "IRFC.NS",
  "JIOFIN.NS", "DLF.NS", "VBL.NS", "VEDL.NS", "ABB.NS", "INDIGO.NS", "ZOMATO.NS", "PFC.NS",
  "PIDILITIND.NS", "AMBUJACEM.NS", "GODREJCP.NS", "LODHA.NS", "TATAPOWER.NS", "BANKBARODA.NS",
  "GAIL.NS", "PNB.NS", "TECHM.NS", "RECLTD.NS", "HDFCLIFE.NS", "DIVISLAB.NS", "HAVELLS.NS",
  "TVSMOTOR.NS", "ADANIENSOL.NS", "CHOLAFIN.NS", "UNIONBANK.NS", "JSWENERGY.NS", "DABUR.NS",
  "CANBK.NS", "ATGL.NS", "ZYDUSLIFE.NS", "MOTHERSON.NS", "JINDALSTEL.NS", "NHPC.NS",
  "POLYCAB.NS", "CGPOWER.NS", "CUMMINSIND.NS", "BHEL.NS", "TORNTPHARM.NS", "SHREECEM.NS",
  "INDUSTOWER.NS", "BAJAJHLDNG.NS", "BOSCHLTD.NS", "MANKIND.NS"
]);

export const SEGMENT_NIFTY_MIDCAP_50 = new Set([
  "MARICO.NS", "INDHOTEL.NS", "ICICIPRULI.NS", "HDFCAMC.NS", "ICICIGI.NS", "COLPAL.NS", "NAUKRI.NS",
  "MAXHEALTH.NS", "GODREJPROP.NS", "IRCTC.NS", "RVNL.NS", "TIINDIA.NS", "NMDC.NS", "LUPIN.NS",
  "HINDPETRO.NS", "AUROPHARMA.NS", "BHARATFORG.NS", "SUPREMEIND.NS", "OFSS.NS", "YESBANK.NS",
  "INDIANB.NS", "TORNTPOWER.NS", "PRESTIGE.NS", "OBEROIRLTY.NS", "SRF.NS", "SBICARD.NS",
  "ASHOKLEY.NS", "SUZLON.NS", "OIL.NS", "CONCOR.NS", "MAZDOCK.NS", "SAIL.NS", "BALKRISIND.NS",
  "ABCAPITAL.NS", "DIXON.NS", "PERSISTENT.NS", "ALKEM.NS", "JSWINFRA.NS", "POLICYBZR.NS",
  "ASTRAL.NS", "BERGEPAINT.NS", "PIIND.NS", "BANKINDIA.NS", "IDFCFIRSTB.NS", "MRF.NS",
  "BDL.NS", "SJVN.NS", "GMRINFRA.NS", "TATACOMM.NS", "PATANJALI.NS"
]);

export const SEGMENT_NIFTY_MIDCAP_51_100 = new Set([
  "LTTS.NS", "AUBANK.NS", "NYKAA.NS", "VOLTAS.NS", "MAHABANK.NS", "ACC.NS", "MPHASIS.NS",
  "FACT.NS", "PETRONET.NS", "APLAPOLLO.NS", "TATAELXSI.NS", "ESCORTS.NS", "TATATECH.NS",
  "PAGEIND.NS", "KALYANKJIL.NS", "LTF.NS", "KPITTECH.NS", "UPL.NS", "GUJGASLTD.NS",
  "BIOCON.NS", "FEDERALBNK.NS", "SONACOMS.NS", "LICHSGFIN.NS", "BSE.NS", "COFORGE.NS",
  "POONAWALLA.NS", "FORTIS.NS", "M&MFIN.NS", "JUBLFOOD.NS", "DALBHARAT.NS", "ABFRL.NS",
  "IGL.NS", "MFSL.NS", "BANDHANBNK.NS", "DEEPAKNTR.NS", "APOLLOTYRE.NS", "GLAND.NS",
  "IPCALAB.NS", "DELHIVERY.NS", "SUNTV.NS", "SYNGENE.NS", "TATACHEM.NS", "PAYTM.NS",
  "LAURUSLABS.NS", "LALPATHLAB.NS", "PEL.NS", "ZEEL.NS", "UNITDSPR.NS", "EXIDEIND.NS",
  "GLENMARK.NS"
]);

export const SEGMENT_NIFTY_MIDCAP_101_150 = new Set([
  "COCHINSHIP.NS", "HUDCO.NS", "NBCC.NS", "IRCON.NS", "RAILTEL.NS", "RITES.NS", "MOTILALOFS.NS",
  "CDSL.NS", "ANGELONE.NS", "RADICO.NS", "KARURVYSYA.NS", "EQUITASBNK.NS", "UJJIVANSFB.NS",
  "PNBHOUSING.NS", "CREDITACC.NS", "CRAFTSMAN.NS", "CERA.NS", "CANFINHOME.NS", "KPRMILL.NS",
  "BLS.NS", "CASTROLIND.NS", "JYOTHYLAB.NS", "CHAMBLFERT.NS", "JUBLINGREA.NS", "CESC.NS",
  "NATIONALUM.NS", "GRAPHITE.NS", "HEG.NS", "TIMKEN.NS", "SKFINDIA.NS", "SCHAEFFLER.NS",
  "THERMAX.NS", "TRIVENI.NS", "AIAENG.NS", "GRINDWELL.NS", "CARBORUNIV.NS", "CENTURYTEX.NS",
  "GODREJIND.NS", "JBCHEPHARM.NS", "NATCOPHARM.NS", "AJANTPHARM.NS", "ERIS.NS", "GRANULES.NS",
  "MEDANTA.NS", "RAJESHEXPO.NS", "BLUEDART.NS", "MAHINDCIE.NS", "ENDURANCE.NS", "BATAINDIA.NS",
  "METROPOLIS.NS"
]);

export const SEGMENT_NIFTY_SMALLCAP_50 = new Set([
  "SUZLON.NS", "COCHINSHIP.NS", "HUDCO.NS", "NBCC.NS", "IRCON.NS", "RAILTEL.NS", "RITES.NS",
  "CDSL.NS", "ANGELONE.NS", "BSE.NS", "KARURVYSYA.NS", "AFFLE.NS", "SONATSOFTW.NS", "RADICO.NS",
  "PRAJIND.NS", "TEJASNET.NS", "KAYNES.NS", "CEAT.NS", "CASTROLIND.NS", "JYOTHYLAB.NS",
  "CHAMBLFERT.NS", "JUBLINGREA.NS", "GLENMARK.NS", "GRANULES.NS", "EQUITASBNK.NS", "UJJIVANSFB.NS",
  "PNBHOUSING.NS", "CREDITACC.NS", "CRAFTSMAN.NS", "CERA.NS", "CANFINHOME.NS", "HAPPSTMNDS.NS",
  "ROUTE.NS", "LATENTVIEW.NS", "TANLA.NS", "MAPMYINDIA.NS", "CYIENT.NS", "ZENSARTECH.NS",
  "BSOFT.NS", "INTELLECT.NS", "TATAINVEST.NS", "IIFL.NS", "MANAPPURAM.NS", "AAVAS.NS",
  "HOMEFIRST.NS", "CAMS.NS", "UTIAMC.NS", "KFINTECH.NS", "J&KBANK.NS", "SOUTHBANK.NS"
]);

export const SEGMENT_NIFTY_SMALLCAP_51_100 = new Set([
  "CSBBANK.NS", "DCBBANK.NS", "RBLBANK.NS", "FINPIPE.NS", "SUPRAJIT.NS", "JAMNAAUTO.NS",
  "LUMAXIND.NS", "SUBROS.NS", "GABRIEL.NS", "PRICOLLTD.NS", "SHARDACROP.NS", "RALLIS.NS",
  "DHANUKA.NS", "GODREJAGRO.NS", "BALRAMCHIN.NS", "EIDPARRY.NS", "RENUKA.NS", "TRIVENI.NS",
  "AVANTIFEED.NS", "KRBL.NS", "LTFOODS.NS", "TASTYBITE.NS", "CCL.NS", "BIKAJI.NS",
  "MRSBECTORS.NS", "CAMPUS.NS", "REDTAPE.NS", "RELAXO.NS", "LIBERTSHOE.NS", "VIPIND.NS",
  "SAFARI.NS", "GREENPANEL.NS", "CENTURYPLY.NS", "GREENPLY.NS", "KAJARIACER.NS", "SOMANYCERA.NS",
  "PRINCEPIPE.NS", "ASTEC.NS", "FINEORG.NS", "CLEAN.NS", "ANUPAM.NS", "ROSSARI.NS",
  "NEOGEN.NS", "TATASTLLP.NS", "JINDALSAW.NS", "WELCORP.NS", "RATNAMANI.NS", "APARINDS.NS",
  "KEI.NS", "FINCABLES.NS"
]);

export const SEGMENT_NIFTY_SMALLCAP_101_250 = new Set([
  "RRKABEL.NS", "HBLPOWER.NS", "ELECON.NS", "KEC.NS", "KALPATPOWR.NS", "ENGINERSIN.NS",
  "POWERMECH.NS", "IONEXCHANG.NS", "VAIBHAVGBL.NS", "THENGAD.NS", "SWANENERGY.NS", "PCBL.NS",
  "BORORENEW.NS", "JINDWORLD.NS", "PTC.NS", "BFUTILITIE.NS", "SHILPAMED.NS", "SUPRIYA.NS",
  "FDC.NS", "NEULANDLAB.NS", "DISHTV.NS", "TV18BRDCST.NS", "NAZARA.NS", "PVRINOX.NS",
  "TIPSINDLTD.NS", "SAREGAMA.NS", "NETWORK18.NS", "JUSTDIAL.NS", "EASEMYTRIP.NS", "LEMONTREE.NS",
  "CHALET.NS", "EIHOTEL.NS", "TAJGVK.NS", "DATAPATTNS.NS", "MTARTECH.NS", "PARAS.NS",
  "ASTRAZEN.NS", "CENTUM.NS", "EMUDHRA.NS", "RATEGAIN.NS", "IDEAFORGE.NS", "AETHER.NS",
  "DREAMFOLKS.NS", "LANDMARK.NS", "CMSINFO.NS", "KIMS.NS", "ASTERDM.NS", "NH.NS",
  "RAINBOW.NS", "ARTEMIS.NS", "SHALBY.NS", "YATHARTH.NS", "JUPITERIN.NS", "TEXRAIL.NS",
  "TITAGARH.NS", "BEML.NS", "GRSE.NS", "MASTEK.NS", "NEWGEN.NS", "ALLCARGO.NS"
]);

export const SEGMENT_NIFTY_MICROCAP_250 = new Set([
  "ZENTEC.NS", "DYNAMATECH.NS", "SHARDAMOTR.NS", "NUCLEUS.NS", "TANFACIND.NS", "SIGACHI.NS",
  "VISHNU.NS", "STYLAMIND.NS", "ARTEMISMED.NS", "SAKSOFT.NS", "GENSOL.NS", "QUICKHEAL.NS",
  "ZAGGLE.NS", "APOLLO.NS", "KRN.NS", "DIFFUSION.NS", "ORIENTTECH.NS", "PREMIERENE.NS",
  "BAJAJHFL.NS", "JYOTICNC.NS", "INOXINDIA.NS", "DCXINDIA.NS", "HARSHA.NS", "SYRMA.NS",
  "AVALON.NS", "CYIENTDLM.NS", "NETWEB.NS", "EMSLIMITED.NS", "RISHABH.NS", "YATRA.NS",
  "FEDFINA.NS", "FLAIR.NS", "HAPPYFORGE.NS", "EPACK.NS", "NOVAAGRI.NS", "BLSE.NS",
  "RKSWAMY.NS", "JNKINDIA.NS", "TBOTEK.NS", "AADHARHFC.NS", "AWFIS.NS", "KRONOX.NS",
  "IXIGO.NS", "STANLEY.NS", "DEE.NS", "AKUMS.NS", "CEIGALL.NS", "OLAELEC.NS",
  "UNIECOM.NS", "WAREE.NS", "DEEPAK.NS", "GODAVARI.NS", "AFCONS.NS", "SAGILITY.NS",
  "SWIGGY.NS", "NTPCGREEN.NS", "ENVIRO.NS", "VENTURA.NS", "INDOGULF.NS", "NACLIND.NS",
  "BALAJITELE.NS", "ONMOBILE.NS", "SURYAROSNI.NS", "JISLJALEQS.NS", "GOCLCORP.NS"
]);

/**
 * Determine which of the 15 universes a given stock ticker belongs to.
 */
export function getUniversesForTicker(ticker: string): UniverseId[] {
  const sym = ticker.toUpperCase().trim();
  const universes: UniverseId[] = [];

  const inNifty50 = SEGMENT_NIFTY_50.has(sym);
  const inNext50 = SEGMENT_NIFTY_NEXT_50.has(sym);
  const inMid50 = SEGMENT_NIFTY_MIDCAP_50.has(sym);
  const inMid51_100 = SEGMENT_NIFTY_MIDCAP_51_100.has(sym);
  const inMid101_150 = SEGMENT_NIFTY_MIDCAP_101_150.has(sym);

  const inMid100 = inMid50 || inMid51_100;
  const inMid150 = inMid100 || inMid101_150;

  const inSmall50 = SEGMENT_NIFTY_SMALLCAP_50.has(sym);
  const inSmall51_100 = SEGMENT_NIFTY_SMALLCAP_51_100.has(sym);
  const inSmall101_250 = SEGMENT_NIFTY_SMALLCAP_101_250.has(sym);

  const inSmall100 = inSmall50 || inSmall51_100;
  const inSmall250 = inSmall100 || inSmall101_250;

  const inMicro250 = SEGMENT_NIFTY_MICROCAP_250.has(sym);

  // 1. Nifty 50
  if (inNifty50) universes.push('nifty-50');

  // 2. Nifty Next 50
  if (inNext50) universes.push('nifty-next-50');

  // 3. Nifty 100
  if (inNifty50 || inNext50) universes.push('nifty-100');

  // 4. Nifty 200 (Nifty 100 + Midcap 100)
  if (inNifty50 || inNext50 || inMid100) universes.push('nifty-200');

  // 5. Nifty Midcap 50
  if (inMid50) universes.push('nifty-midcap-50');

  // 6. Nifty Midcap 100
  if (inMid100) universes.push('nifty-midcap-100');

  // 7. Nifty Midcap 150
  if (inMid150) universes.push('nifty-midcap-150');

  // 8. Nifty Smallcap 50
  if (inSmall50) universes.push('nifty-smallcap-50');

  // 9. Nifty Smallcap 100
  if (inSmall100) universes.push('nifty-smallcap-100');

  // 10. Nifty Smallcap 250
  if (inSmall250) universes.push('nifty-smallcap-250');

  // 11. Nifty LargeMidcap 250 (Nifty 100 + Midcap 150)
  if (inNifty50 || inNext50 || inMid150) universes.push('nifty-largemidcap-250');

  // 12. Nifty Midsmallcap 400 (Midcap 150 + Smallcap 250)
  if (inMid150 || inSmall250) universes.push('nifty-midsmallcap-400');

  // 13. Nifty 500 (Nifty 100 + Midcap 150 + Smallcap 250)
  if (inNifty50 || inNext50 || inMid150 || inSmall250) universes.push('nifty-500');

  // 14. Nifty Microcap 250
  if (inMicro250) universes.push('nifty-microcap-250');

  // 15. Nifty Total Market (Nifty 500 + Microcap 250)
  if (inNifty50 || inNext50 || inMid150 || inSmall250 || inMicro250) {
    universes.push('nifty-total-market');
  }

  // Fallback: If not explicitly found in sets, assign to Nifty 500 & Total Market as default broad universe
  if (universes.length === 0) {
    universes.push('nifty-500', 'nifty-total-market');
  }

  return universes;
}

export function getMarketCapTier(ticker: string): 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Micro Cap' {
  const sym = ticker.toUpperCase().trim();
  if (SEGMENT_NIFTY_50.has(sym) || SEGMENT_NIFTY_NEXT_50.has(sym)) return 'Large Cap';
  if (
    SEGMENT_NIFTY_MIDCAP_50.has(sym) ||
    SEGMENT_NIFTY_MIDCAP_51_100.has(sym) ||
    SEGMENT_NIFTY_MIDCAP_101_150.has(sym)
  ) {
    return 'Mid Cap';
  }
  if (
    SEGMENT_NIFTY_SMALLCAP_50.has(sym) ||
    SEGMENT_NIFTY_SMALLCAP_51_100.has(sym) ||
    SEGMENT_NIFTY_SMALLCAP_101_250.has(sym)
  ) {
    return 'Small Cap';
  }
  return 'Micro Cap';
}
