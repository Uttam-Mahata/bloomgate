package com.bloomgate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BloomgateApplication {
    public static void main(String[] args) {
        SpringApplication.run(BloomgateApplication.class, args);
        System.out.println("""

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎓 BloomGate Exam Paper Generator (Spring Boot)            ║
║   ─────────────────────────────────────────────────────────   ║
║                                                               ║
║   Server running at: http://localhost:3001                    ║
║   API Endpoint:      http://localhost:3001/api                ║
║                                                               ║
║   Features:                                                   ║
║   • Question Bank Management (weights & complexity)          ║
║   • Smart Exam Paper Generation                              ║
║   • PDF Export & Distribution                                ║
║   • BloomJoin Sync for Modifications                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
""");
    }
}
