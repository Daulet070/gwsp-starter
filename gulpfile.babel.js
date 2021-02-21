'use strict';

import fs from 'fs';

import { src, dest, parallel, series, watch } from 'gulp';
import browsersync   from 'browser-sync';
import webpack       from 'webpack';
import webpackStream from 'webpack-stream';
import del           from 'del';
import yargs         from 'yargs';
import gulpif        from 'gulp-if';
import pug           from 'gulp-pug-3';
import scss          from 'gulp-sass';
import autoprefixer  from 'gulp-autoprefixer';
import gcmq          from 'gulp-group-css-media-queries';
import cleanCSS      from 'gulp-clean-css';
import plumber       from 'gulp-plumber';
import imagemin      from 'gulp-imagemin';
import debug         from 'gulp-debug';
import rename        from 'gulp-rename';
import webp          from 'gulp-webp';
import webphtml      from 'gulp-webp-html';
import webpcss       from 'gulp-webpcss';
import ttf2woff      from 'gulp-ttf2woff';
import ttf2woff2     from 'gulp-ttf2woff2';
import smartgrid     from 'smart-grid';
import eslint        from 'gulp-eslint';
// import plugins from 'gulp-load-plugins';

import webpackConfig from './webpack.config.js';
    
const buildDir = 'docs';
const srcDir = 'src';

const path = {
  build: {
    html:  buildDir + '/',
    css:   buildDir + '/css/',
    js:    buildDir + '/js/',
    img:   buildDir + '/img/',
    fonts: buildDir + '/fonts/',
  },
  src: {
    html:  srcDir + '/*.pug',
    css:   srcDir + '/scss/**/*.scss',
    js:    srcDir + '/js/index.js',
    img:   srcDir + '/img/**/*.{jpg,png,svg,ico,webp}',
    fonts: srcDir + '/fonts/*.ttf',
  },
  watch: {
    html:  srcDir + '/**/*.pug',
    css:   srcDir + '/**/*.scss',
    js:    srcDir + '/js/**/*.js',
    img:   srcDir + '/img/**/*.{jpg,png,svg,ico,webp}',
  },
  clean: './' + buildDir + '/'
};


const production = !!yargs.argv.production;

webpackConfig.mode = production ? 'production' : 'development';
webpackConfig.devtool = production ? false : 'source-map';

const browserSync = () => {
  browsersync.init({
    server: {
      baseDir: `./${buildDir}/`
    },
    port: 3000,
    notify: false
  });
};

const html = () => {
  return src(path.src.html)
    .pipe(plumber())
    .pipe(pug({
      pretty:true, doctype:'HTML'
    }))
    .pipe(plumber.stop())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
};

const css = () => {
  return src(path.src.css)
    .pipe(scss({
      outputStyle: 'expanded'
    }))
    .pipe(gcmq())
    .pipe(autoprefixer({
      overrideBrouserList: ['last 5 version'],
      cascade: true
    }))
    .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(cleanCSS())
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
};

const images = () => {
  return src(path.src.img)
    .pipe(webp({
      quality: 70
    }))
    .pipe(src(path.src.img))
    .pipe(dest(path.build.img))
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ 
        removeViewBox: false 
      }],
      interlaced: true,
      optimizationLevel: 3
    }))
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
};

const js = () => {
  return src(path.src.js)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(webpackStream(webpackConfig), webpack)
    .pipe(gulpif(production, rename({
      suffix: '.min'
    })))
    .pipe(dest(path.build.js))
    .pipe(debug({
      'title': 'JS files'
    }))
    .pipe(browsersync.stream());
};

const fonts = () => {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
};

const fontsStyle = (cb) => {
  let file_content = fs.readFileSync(srcDir + '/scss/base/_fonts.scss');
  if (file_content == '') {
    fs.writeFile(srcDir+ '/scss/base/_fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(srcDir + '/scss/base/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          c_fontname = fontname;
        }
      }
    });
  }
  cb();
};

const layoutGrid = (cb) => {
  smartgrid('src/scss/vendor/import/', {
    outputStyle: 'scss',
    filename: '_smart-grid',
    columns: 12, // number of grid columns
    offset: '0.9375rem', // gutter width - 30px
    mobileFirst: true,
    mixinNames: {
      container: 'container'
    },
    container: {
      fields: '0.9375rem' // side fields - 15px
    },
    breakPoints: {
      xs: {
        width: '20rem' // 320px
      },
      sm: {
        width: '36rem' // 576px
      },
      md: {
        width: '48rem' // 768px
      },
      lg: {
        width: '62rem' // 992px
      },
      xl: {
        width: '75rem' // 1200px
      }
    }
  });
  cb();
};

const watcher = () => {
  watch([path.watch.html], html);
  watch([path.watch.css], css);
  watch([path.watch.img], images);
  watch([path.watch.js], js);
};

const clean = () => del(path.clean);

export const development = series(clean, layoutGrid, parallel(html, css, js, images, fonts), parallel(watcher, browserSync), fontsStyle);
export const prod = series(clean, html, css, js, images, fonts);

export default development;
