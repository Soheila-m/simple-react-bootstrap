const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const remove = require('remove');
const gulpUglify = require('gulp-uglify');
const gulpRename = require('gulp-rename');
const gulp = require('gulp');
const alias = require('rollup-plugin-alias');
const path = require('path');
const fsE = require('fs-extra');

try { remove.removeSync('./dist'); } catch (e) { }

fsE.copySync(path.resolve(__dirname, './src/buttonDropdown.js'), './dist/buttonDropdown.js');
fsE.copySync(path.resolve(__dirname, './src/modal.js'), './dist/modal.js');

const getRollup = entry =>
    rollup.rollup({
        entry,
        plugins: [
            babel({
                presets: ['react', ['es2015', { modules: false }], 'stage-2'],
                plugins: ['external-helpers']
            }),
            alias({
                resolve: ['.es6'],
                './buttonDropdown.js': './buttonDropdown'
            })
        ]
    });

Promise.all([
    getRollup('src/library.es6'),
    getRollup('src/navBar.es6')
]).then(([library, navBar]) =>
    Promise.all([
        library.write({ format: 'cjs', dest: './dist/simple-react-bootstrap.js' }),
        library.write({ format: 'iife', dest: './dist/simple-react-bootstrap-script-tag.js', moduleName: 'SimpleReactBootstrap', globals: { react: 'React', 'react-dom': 'ReactDOM' } }),
        navBar.write({ format: 'cjs', dest: './dist/navBar.js' })
    ])
).then(() => {
    gulp.src('./dist/**/*.js', { base: './' })
        .pipe(gulpUglify())
        .pipe(gulpRename(path => { path.basename = path.basename + '.min'; }))
        .pipe(gulp.dest(''))
}).catch(err => console.log(err));


