import { TrustIndicators } from '../../../components/trust/TrustIndicators'
import { PerformanceBudget } from '../../../components/performance/PerformanceBudget'

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      {/* Hero Section */}
      <section className="hero min-h-[60vh] bg-gradient-to-r from-brand-blue-600 to-brand-blue-800 text-white rounded-lg mb-8">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">BuffrSign</h1>
            <p className="text-xl mb-8">
              Legally compliant digital signatures for Namibia and Southern Africa
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg">Get Started</button>
              <button className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-brand-blue-600">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="mb-8">
        <TrustIndicators className="justify-center" />
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Documents Signed</div>
          <div className="stat-value text-brand-blue-600">10,000+</div>
          <div className="stat-desc">Trusted by businesses across Namibia</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Compliance Rate</div>
          <div className="stat-value text-success">99.9%</div>
          <div className="stat-desc">ETA 2019 & CRAN compliant</div>
        </div>
        <div className="stat bg-base-100 rounded-lg shadow">
          <div className="stat-title">Average Time</div>
          <div className="stat-value text-namibian-gold-600">2.5 min</div>
          <div className="stat-desc">
            <PerformanceBudget estimatedTime={2} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">ETA 2019 Compliant</h2>
            <p>Full compliance with Namibia's Electronic Transactions Act</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">CRAN Accredited</h2>
            <p>Approved by Communications Regulatory Authority of Namibia</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">AI-Powered</h2>
            <p>Intelligent document analysis and smart templates</p>
          </div>
        </div>
      </section>
    </div>
  )
}
