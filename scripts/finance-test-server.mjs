// Local QA only. Never imported by cms/entry.mjs or the deployed Worker.
const mode=process.argv[2];if(!['finance','wallet'].includes(mode))throw new Error('Usa finance o wallet para iniciar una base desechable local.');
const RealDate=Date,instant=mode==='finance'?'2026-11-03T16:00:00Z':'2026-10-25T16:00:00Z';
globalThis.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[instant]));}static now(){return new RealDate(instant).getTime();}};
process.env.PLAYER0_DEV_PORT=mode==='finance'?'8789':'8790';process.env.PLAYER0_DEV_DB=':memory:';
await import('./dev.mjs');
