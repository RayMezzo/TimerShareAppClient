// pages/_document.js
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
            {/* Google Fonts をここに追加 */}
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
            <link href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap" rel="stylesheet"/>
            <link href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Pixelify+Sans:wght@400..700&display=swap" rel="stylesheet"></link>
        </Head>
        <body>
          <Main />
          
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
