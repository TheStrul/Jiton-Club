#!/usr/bin/env python3
"""
Custom HTTP Server with UTF-8 encoding for Jiton Club Poker League
Usage: python server.py [port]
Default port: 8000
"""

import http.server
import socketserver
import sys
import os
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

class UTF8Handler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with UTF-8 encoding support"""
    
    # Override extensions map to ensure UTF-8 charset
    extensions_map = {
        '.html': 'text/html; charset=utf-8',
        '.htm': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.xml': 'application/xml; charset=utf-8',
        '.txt': 'text/plain; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml; charset=utf-8',
        '.ico': 'image/x-icon',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '': 'application/octet-stream',
    }
    
    def end_headers(self):
        """Add UTF-8 encoding header to all responses"""
        # Don't add charset for binary files
        if not any(self.path.endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf']):
            self.send_header('Content-Type', self.get_content_type())
        super().end_headers()
    
    def get_content_type(self):
        """Get content type with UTF-8 charset"""
        path = self.translate_path(self.path)
        base, ext = os.path.splitext(path)
        return self.extensions_map.get(ext, 'text/html; charset=utf-8')
    
    def log_message(self, format, *args):
        """Custom log format with colors"""
        sys.stdout.write(f"\033[92m[{self.log_date_time_string()}]\033[0m {format % args}\n")

def main():
    """Start the server"""
    # Change to web directory
    web_dir = Path(__file__).parent
    os.chdir(web_dir)
    
    with socketserver.TCPServer(("", PORT), UTF8Handler) as httpd:
        print(f"\n{'='*60}")
        print(f"?? Jiton Club Poker League - Development Server")
        print(f"{'='*60}")
        print(f"?? Serving from: {web_dir}")
        print(f"?? Server running at: \033[94mhttp://localhost:{PORT}\033[0m")
        print(f"?? Encoding: UTF-8 (Hebrew support enabled)")
        print(f"{'='*60}")
        print(f"Press \033[91mCtrl+C\033[0m to stop the server\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n\n{'='*60}")
            print(f"?? Server stopped")
            print(f"{'='*60}\n")
            sys.exit(0)

if __name__ == "__main__":
    main()
