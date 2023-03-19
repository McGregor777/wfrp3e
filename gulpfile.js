const gulp = require("gulp");
const prefix = require("gulp-autoprefixer");
const less = require("gulp-less");

function compileLess() {
	return gulp.src("./styles/less/wfrp3e.less")
		.pipe(less())
		.pipe(prefix({cascade: false}))
		.pipe(gulp.dest("./styles"));
}

const css = gulp.series(compileLess);

function watchUpdates() {
	gulp.watch("./styles/less/**/*.less", css);
}

exports.default = gulp.series(compileLess, watchUpdates);
