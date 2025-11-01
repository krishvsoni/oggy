import chalk from 'chalk';

export const OGGY_BANNER = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ██████╗  ██████╗  ██████╗██╗   ██╗    █████╗ ██╗            ║
║  ██╔═══██╗██╔════╝ ██╔════╝╚██╗ ██╔╝   ██╔══██╗██║            ║
║  ██║   ██║██║  ███╗██║  ███╗╚████╔╝    ███████║██║            ║
║  ██║   ██║██║   ██║██║   ██║ ╚██╔╝     ██╔══██║██║            ║
║  ╚██████╔╝╚██████╔╝╚██████╔╝  ██║      ██║  ██║██║            ║
║   ╚═════╝  ╚═════╝  ╚═════╝   ╚═╝      ╚═╝  ╚═╝╚═╝            ║
║                                                               ║
║          AI-Powered Commit Analysis & PR Readiness            ║
║                    by Krish Soni                              ║
╚═══════════════════════════════════════════════════════════════╝
`;

export function displayBanner(): void {
  console.log(chalk.cyan(OGGY_BANNER));
}

export function displaySimpleBanner(): void {
  console.log(chalk.bold.cyan('\n╔═══════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║         OGGY AI Analyzer              ║'));
  console.log(chalk.bold.cyan('╚═══════════════════════════════════════╝\n'));
}
