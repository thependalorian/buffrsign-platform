#!/usr/bin/env python3
"""
BuffrSign Security Audit Script
Scans the codebase for hardcoded secrets and security vulnerabilities
"""

import os
import re
import sys
from pathlib import Path
from typing import List, Dict, Tuple

class SecurityAuditor:
    def __init__(self, root_path: str = "."):
        self.root_path = Path(root_path)
        self.issues = []
        
        # Patterns to detect potential secrets
        self.secret_patterns = [
            # JWT secrets
            (r'JWT_SECRET\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded JWT secret"),
            (r'jwt\.encode\([^,]+,\s*["\'][^"\']{20,}["\']', "Hardcoded JWT secret in encode"),
            (r'jwt\.decode\([^,]+,\s*["\'][^"\']{20,}["\']', "Hardcoded JWT secret in decode"),
            
            # API keys
            (r'API_KEY\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded API key"),
            (r'api_key\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded API key"),
            
            # Database passwords
            (r'password\s*=\s*["\'][^"\']{8,}["\']', "Hardcoded password"),
            (r'PASSWORD\s*=\s*["\'][^"\']{8,}["\']', "Hardcoded password"),
            
            # Redis credentials
            (r'REDIS_PASSWORD\s*=\s*["\'][^"\']{8,}["\']', "Hardcoded Redis password"),
            (r'REDIS_HOST\s*=\s*["\'][^"\']{8,}["\']', "Hardcoded Redis host"),
            
            # Supabase keys
            (r'SUPABASE_KEY\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded Supabase key"),
            (r'SUPABASE_URL\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded Supabase URL"),
            
            # General secrets
            (r'secret\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded secret"),
            (r'SECRET\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded secret"),
            
            # Tokens
            (r'token\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded token"),
            (r'TOKEN\s*=\s*["\'][^"\']{20,}["\']', "Hardcoded token"),
        ]
        
        # Files to exclude from scanning
        self.exclude_patterns = [
            r'\.git/',
            r'node_modules/',
            r'__pycache__/',
            r'\.venv/',
            r'venv/',
            r'\.env$',
            r'\.env\.local$',
            r'\.env\.example$',
            r'\.pyc$',
            r'\.log$',
            r'\.tmp$',
            r'\.cache$',
        ]
        
        # File extensions to scan
        self.scan_extensions = ['.py', '.js', '.ts', '.jsx', '.tsx', '.json', '.yaml', '.yml', '.toml', '.ini', '.cfg']

    def should_exclude_file(self, file_path: Path) -> bool:
        """Check if file should be excluded from scanning"""
        file_str = str(file_path)
        for pattern in self.exclude_patterns:
            if re.search(pattern, file_str):
                return True
        return False

    def should_scan_file(self, file_path: Path) -> bool:
        """Check if file should be scanned"""
        return (file_path.suffix in self.scan_extensions and 
                not self.should_exclude_file(file_path))

    def scan_file(self, file_path: Path) -> List[Dict]:
        """Scan a single file for security issues"""
        issues = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                
                for line_num, line in enumerate(lines, 1):
                    for pattern, description in self.secret_patterns:
                        if re.search(pattern, line, re.IGNORECASE):
                            issues.append({
                                'file': str(file_path),
                                'line': line_num,
                                'description': description,
                                'code': line.strip(),
                                'severity': 'HIGH'
                            })
                            
        except Exception as e:
            issues.append({
                'file': str(file_path),
                'line': 0,
                'description': f"Error reading file: {str(e)}",
                'code': '',
                'severity': 'ERROR'
            })
            
        return issues

    def scan_directory(self) -> List[Dict]:
        """Scan entire directory for security issues"""
        all_issues = []
        
        for file_path in self.root_path.rglob('*'):
            if file_path.is_file() and self.should_scan_file(file_path):
                issues = self.scan_file(file_path)
                all_issues.extend(issues)
                
        return all_issues

    def check_environment_files(self) -> List[Dict]:
        """Check for proper environment file setup"""
        issues = []
        
        env_files = [
            '.env',
            '.env.local',
            '.env.example',
            '.env.production',
            '.env.development'
        ]
        
        for env_file in env_files:
            env_path = self.root_path / env_file
            if env_file == '.env.example':
                if not env_path.exists():
                    issues.append({
                        'file': str(env_path),
                        'line': 0,
                        'description': "Missing .env.example file",
                        'code': '',
                        'severity': 'MEDIUM'
                    })
            elif env_file == '.env':
                if env_path.exists():
                    # Check if .env is in .gitignore
                    gitignore_path = self.root_path / '.gitignore'
                    if gitignore_path.exists():
                        with open(gitignore_path, 'r') as f:
                            gitignore_content = f.read()
                            if '.env' not in gitignore_content:
                                issues.append({
                                    'file': str(gitignore_path),
                                    'line': 0,
                                    'description': ".env file exists but not in .gitignore",
                                    'code': '',
                                    'severity': 'HIGH'
                                })
        
        return issues

    def run_audit(self) -> Dict:
        """Run complete security audit"""
        print("🔍 Starting BuffrSign Security Audit...")
        print("=" * 60)
        
        # Scan for hardcoded secrets
        print("📋 Scanning for hardcoded secrets...")
        secret_issues = self.scan_directory()
        
        # Check environment files
        print("📋 Checking environment file setup...")
        env_issues = self.check_environment_files()
        
        all_issues = secret_issues + env_issues
        
        # Group issues by severity
        high_issues = [i for i in all_issues if i['severity'] == 'HIGH']
        medium_issues = [i for i in all_issues if i['severity'] == 'MEDIUM']
        error_issues = [i for i in all_issues if i['severity'] == 'ERROR']
        
        # Print results
        print(f"\n📊 Audit Results:")
        print(f"   🔴 HIGH severity issues: {len(high_issues)}")
        print(f"   🟡 MEDIUM severity issues: {len(medium_issues)}")
        print(f"   ⚠️  ERROR issues: {len(error_issues)}")
        print(f"   📝 Total issues: {len(all_issues)}")
        
        if high_issues:
            print(f"\n🔴 HIGH SEVERITY ISSUES (CRITICAL):")
            for issue in high_issues:
                print(f"   📁 {issue['file']}:{issue['line']}")
                print(f"   🚨 {issue['description']}")
                print(f"   💻 {issue['code']}")
                print()
        
        if medium_issues:
            print(f"\n🟡 MEDIUM SEVERITY ISSUES:")
            for issue in medium_issues:
                print(f"   📁 {issue['file']}:{issue['line']}")
                print(f"   ⚠️  {issue['description']}")
                print()
        
        if error_issues:
            print(f"\n⚠️  ERROR ISSUES:")
            for issue in error_issues:
                print(f"   📁 {issue['file']}:{issue['line']}")
                print(f"   ❌ {issue['description']}")
                print()
        
        # Recommendations
        print(f"\n💡 Security Recommendations:")
        if high_issues:
            print("   🔴 IMMEDIATE ACTIONS REQUIRED:")
            print("      • Remove all hardcoded secrets from code")
            print("      • Use environment variables for all sensitive data")
            print("      • Add .env to .gitignore if not already present")
            print("      • Rotate any exposed secrets immediately")
        else:
            print("   ✅ No critical security issues found!")
        
        print("   📋 GENERAL BEST PRACTICES:")
        print("      • Use .env files for all configuration")
        print("      • Never commit secrets to version control")
        print("      • Use strong, unique secrets for each environment")
        print("      • Regularly rotate secrets and API keys")
        print("      • Use secrets management services in production")
        
        return {
            'total_issues': len(all_issues),
            'high_issues': len(high_issues),
            'medium_issues': len(medium_issues),
            'error_issues': len(error_issues),
            'issues': all_issues
        }

def main():
    """Main function"""
    if len(sys.argv) > 1:
        root_path = sys.argv[1]
    else:
        root_path = "."
    
    auditor = SecurityAuditor(root_path)
    results = auditor.run_audit()
    
    # Exit with error code if high severity issues found
    if results['high_issues'] > 0:
        print(f"\n❌ Security audit failed with {results['high_issues']} critical issues!")
        sys.exit(1)
    else:
        print(f"\n✅ Security audit passed!")
        sys.exit(0)

if __name__ == "__main__":
    main()
