// react-syntax-highlighter, its Prism core and three language grammars are
// only ever needed once someone opens a project modal and scrolls to a code
// block. Imported statically they rode into the entry chunk, which every
// visitor downloads before React can mount — and on a phone that download is
// what gates the moment the hero finishes rendering. Isolated here, the
// bundler gives them their own chunk that a first paint never asks for.
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';

SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('csharp', csharp);

const CodeHighlighter = ({ language, code }: { language: string; code: string }) => (
  <SyntaxHighlighter
    language={language}
    style={vscDarkPlus}
    customStyle={{
      margin: 0,
      padding: '1.5rem',
      fontSize: '0.875rem',
      lineHeight: '1.6',
      backgroundColor: '#1e1e1e',
    }}
    showLineNumbers={true}
  >
    {code}
  </SyntaxHighlighter>
);

export default CodeHighlighter;
