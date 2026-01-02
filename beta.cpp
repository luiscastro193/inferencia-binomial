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

static beta distribution(.5, .5);

extern "C" void set_params(double a, double b) {
	distribution = beta(a, b);
}

extern "C" double quantile(double p) {
	return boost::math::quantile(distribution, p);
}

extern "C" double pdf(double x) {
	return boost::math::pdf(distribution, x);
}
