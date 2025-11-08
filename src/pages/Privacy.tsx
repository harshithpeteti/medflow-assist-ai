import { Link } from "react-router-dom";
import { Shield, Lock, Eye, FileText, Bell, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MedFlow</span>
          </Link>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Privacy Notice</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your privacy and the security of your medical data are our top priorities.
          </p>
          <p className="text-sm text-muted-foreground mt-2">Last updated: November 8, 2024</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          {/* Key Commitments */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">HIPAA Compliant</h3>
              <p className="text-sm text-muted-foreground">
                Full compliance with healthcare data protection regulations
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">End-to-End Encryption</h3>
              <p className="text-sm text-muted-foreground">
                All data encrypted in transit and at rest
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Access Control</h3>
              <p className="text-sm text-muted-foreground">
                Role-based permissions and audit logs
              </p>
            </Card>
          </div>

          {/* Privacy Policy Sections */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Information We Collect
              </h2>
              <Card className="p-6">
                <div className="space-y-4 text-foreground">
                  <p><strong>Medical Information:</strong> Clinical notes, consultation transcripts, diagnoses, prescriptions, lab orders, and patient medical history as entered by healthcare providers.</p>
                  <p><strong>Account Information:</strong> Name, email address, professional credentials, medical license numbers, and institutional affiliations.</p>
                  <p><strong>Usage Data:</strong> Login times, feature usage patterns, system interactions, and performance metrics to improve service quality.</p>
                  <p><strong>Device Information:</strong> Browser type, IP address, operating system, and device identifiers for security and compatibility purposes.</p>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                How We Use Your Information
              </h2>
              <Card className="p-6">
                <ul className="space-y-3 text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Provide clinical documentation and workflow automation services</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Generate AI-powered clinical notes and task detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Facilitate communication between healthcare providers, labs, and pharmacies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Maintain system security and prevent unauthorized access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Improve AI accuracy and service functionality (with de-identified data only)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>Comply with legal and regulatory requirements</span>
                  </li>
                </ul>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Data Security
              </h2>
              <Card className="p-6">
                <div className="space-y-4 text-foreground">
                  <p><strong>Encryption:</strong> All data is encrypted using industry-standard AES-256 encryption at rest and TLS 1.3 in transit.</p>
                  <p><strong>Access Controls:</strong> Multi-factor authentication, role-based access control, and principle of least privilege enforcement.</p>
                  <p><strong>Audit Logging:</strong> Comprehensive logging of all system access and data modifications with tamper-proof records.</p>
                  <p><strong>Infrastructure:</strong> Hosted on HIPAA-compliant cloud infrastructure with regular security audits and penetration testing.</p>
                  <p><strong>Data Backup:</strong> Automated encrypted backups with disaster recovery procedures.</p>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" />
                Data Sharing & Disclosure
              </h2>
              <Card className="p-6">
                <div className="space-y-4 text-foreground">
                  <p>We do not sell, rent, or trade patient health information. We may share information only in the following circumstances:</p>
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Healthcare Operations:</strong> With authorized healthcare providers, labs, pharmacies, and specialists as directed by the treating physician</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Legal Compliance:</strong> When required by law, court order, or regulatory authorities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Service Providers:</strong> With vetted HIPAA-compliant vendors who assist in service delivery (all bound by strict confidentiality agreements)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Emergency Situations:</strong> To prevent serious harm to patients or public safety</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                Your Rights
              </h2>
              <Card className="p-6">
                <div className="space-y-4 text-foreground">
                  <p>As a healthcare provider or patient, you have the following rights:</p>
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Access:</strong> Request access to your personal and health information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Correction:</strong> Request corrections to inaccurate information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Deletion:</strong> Request deletion of information (subject to legal retention requirements)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Data Portability:</strong> Receive your data in a structured, machine-readable format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Opt-Out:</strong> Decline certain uses of your information where permitted by law</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Trash2 className="h-6 w-6 text-primary" />
                Data Retention
              </h2>
              <Card className="p-6">
                <div className="space-y-4 text-foreground">
                  <p>We retain your information for as long as necessary to provide services and comply with legal obligations:</p>
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Clinical Records:</strong> Retained according to applicable healthcare regulations (typically 7-10 years)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Account Data:</strong> Retained while your account is active and for 90 days after closure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span><strong>Audit Logs:</strong> Maintained for 7 years for compliance and security purposes</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Section */}
          <Card className="mt-12 p-8 bg-primary/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Questions or Concerns?</h2>
            <p className="text-foreground mb-6">
              If you have any questions about this Privacy Notice or wish to exercise your rights, please contact our Privacy Office:
            </p>
            <div className="space-y-2 text-foreground">
              <p><strong>Email:</strong> privacy@medflow.com</p>
              <p><strong>Phone:</strong> 1-800-MEDFLOW</p>
              <p><strong>Mail:</strong> MedFlow Privacy Office, 123 Healthcare Blvd, San Francisco, CA 94105</p>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2024 MedFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Privacy;
