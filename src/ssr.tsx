import * as ReactDOMServer from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';
import App from './app';

export default function render(count: number) {
  const sheet = new ServerStyleSheet();

  try {
    const html = ReactDOMServer.renderToString(
      sheet.collectStyles(<App countFromServer={count}/>) as any
    );
    const styleTags = sheet.getStyleTags();

    return { html, styleTags };
  } catch (error) {
    throw error;
  } finally {
    sheet.seal();
  }
}