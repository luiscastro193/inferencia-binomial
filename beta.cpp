#include <emscripten/emscripten.h>
#define CAPI extern "C" EMSCRIPTEN_KEEPALIVE
#define WASM_SIMD_COMPAT_SLOW

#include <boost/math/distributions/beta.hpp>
#include <boost/math/policies/policy.hpp>

namespace policies = boost::math::policies;

using wasm_policy = policies::policy<
	policies::domain_error<policies::ignore_error>,
	policies::overflow_error<policies::ignore_error>,
	policies::underflow_error<policies::ignore_error>,
	policies::evaluation_error<policies::ignore_error>
>;

using beta = boost::math::beta_distribution<double, wasm_policy>;

constexpr int PDF_DENSITY = 10000;
constexpr int PDF_N = PDF_DENSITY + 1;
constexpr double PDF_STEP = 1.0 / PDF_DENSITY;

static beta distribution;
static double pdfs[PDF_N];

CAPI void set_params(double a, double b) {
	distribution = beta(a, b);
	for (int i = 0; i < PDF_N; ++i) pdfs[i] = boost::math::pdf(distribution, i * PDF_STEP);
}

CAPI double quantile(double p) {
	return boost::math::quantile(distribution, p);
}

CAPI double* pdfs_pointer() {
	return pdfs;
}
