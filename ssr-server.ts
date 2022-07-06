import webpack, { Compiler } from 'webpack';
import { createFsFromVolume, Volume} from 'memfs';
import ejs from 'ejs';
const nodeEval = require('node-eval');

export class Ssr {
  private compiler?: webpack.Compiler;
  private fs = createFsFromVolume(new Volume());
  constructor() {}

  ssrHtml(p: string) {
    return new Promise((resolve, reject) => {
      const exec = async () => {
        try {
          const template = this.fs.readFileSync('/index.html', 'utf-8');
          const js = this.fs.readFileSync('/ssr-index.js', 'utf-8');

          try {
            const render = nodeEval(js, './ssr-index.js') as (count: number) => {html: string; styleTags: string;};
            const count = 2;
            const {html, styleTags} = render(count);

            resolve(ejs.render(template as string, {ssrHTML: html, ssrSTYLE: styleTags, ssrDATA: `window.ssrData = ${JSON.stringify({count})}`}))
          } catch (error) {
            resolve(ejs.render(template as string, {
              ssrHTML: '', ssrSTYLE: '', ssrDATA: ''
            }))
          }
        } catch (error) {
          setTimeout(() => {
            exec();
          }, 0);
        }
      }

      exec();
    });
  }

  getWebpackPlugin() {
    return {
      apply: (compiler: Compiler) => {
        this.initSelfCompiler(compiler);

        compiler.hooks.emit.tap('ssr-plugin', (compilation) => {
          Object.entries(compilation.assets ?? {}).forEach(([key, source]) => {
            if (key.endsWith('.html')) {
              this.fs.writeFileSync(`/${key}`, source.buffer())
            }
          });
        });
      }
    }
  }

  private initSelfCompiler = (compiler: Compiler) => {
    this.compiler = webpack({
      mode: compiler.options.mode,
      target: 'node',
      entry: {
        ssr: './src/ssr.tsx',
      },
      module: compiler.options.module,
      resolve: compiler.options.resolve,
      output: {
        filename: '[name]-index.js',
        chunkFormat: 'commonjs',
        library: {
          type: 'commonjs2',
          export: 'default'
        },
        path: compiler.options.mode === 'development' ? '/' : compiler.options.output?.path
      },
      plugins: [
        new webpack.DefinePlugin({
          SITE: JSON.stringify('server')
        })
      ]
    });

    if (compiler.options.mode === 'development') {
      // 开发环境直接写入到内存中
      this.compiler.outputFileSystem = this.fs;

      this.compiler.watch({}, (err, stats) => {
        if (err) {
          console.log(err);
        } else {
          
        }
      });
    } else {
      this.compiler.run(() => {
        compiler.close(() => {});
      })
    }
  }
}