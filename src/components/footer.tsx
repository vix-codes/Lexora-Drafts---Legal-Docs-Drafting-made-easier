
'use client';

export default function Footer() {
  return (
    <footer className="border-t bg-card/50 text-center text-sm text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div>
            <p>&copy; {new Date().getFullYear()} lexintel. All rights reserved.</p>
            <p className="italic">Empowering legal access through AI-driven guidance.</p>
        </div>
        <div>
            <p className="font-medium">Built with care by:</p>
            <p>Mithra N • Yashwanth RT • Vignesh M</p>
            <p className="text-xs">MCA Students, PSG College of Technology</p>
        </div>
      </div>
    </footer>
  );
}
