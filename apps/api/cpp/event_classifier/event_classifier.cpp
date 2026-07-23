#include <algorithm>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

namespace {

constexpr std::size_t MAX_PAYLOAD_BYTES = 1024 * 1024;

std::string lower_copy(std::string value) {
    std::transform(value.begin(), value.end(), value.begin(), [](unsigned char c) {
        return static_cast<char>(std::tolower(c));
    });
    return value;
}

std::string classify(const std::string& event_type, const std::string& payload) {
    const std::string text = lower_copy(event_type + " " + payload);
    if (text.find("honeytoken") != std::string::npos || text.find("credential") != std::string::npos) {
        return "critical";
    }
    if (text.find("/etc/passwd") != std::string::npos || text.find("..%2f") != std::string::npos ||
        text.find("../") != std::string::npos || text.find("union select") != std::string::npos ||
        text.find(" or 1=1") != std::string::npos) {
        return "critical";
    }
    if (text.find("curl ") != std::string::npos || text.find("wget ") != std::string::npos ||
        text.find("powershell") != std::string::npos || text.find("cmd.exe") != std::string::npos) {
        return "high";
    }
    if (text.find("ssh") != std::string::npos || text.find("database") != std::string::npos || text.find("mysql") != std::string::npos) {
        return "high";
    }
    if (text.find("admin") != std::string::npos || text.find("login") != std::string::npos || text.find("api") != std::string::npos) {
        return "medium";
    }
    return "low";
}

void write_export_profile(const std::string& profile, const std::string& event_type, const std::string& severity, const std::string& payload) {
    if (profile == "logforge") {
        std::cout << "{\"service\":\"deceptiongrid\",\"level\":\"" << severity
                  << "\",\"message\":\"" << event_type << "\",\"fields\":{\"payload_preview_size\":"
                  << payload.size() << "}}\n";
        return;
    }
    std::cout << "{\"product\":\"DeceptionGrid\",\"event_type\":\"" << event_type
              << "\",\"severity\":\"" << severity << "\",\"summary\":\"deception event export\"}\n";
}

void write_boundary(const std::string& event_type, const std::string& payload) {
    const std::string severity = classify(event_type, payload);
    const bool alert = severity == "medium" || severity == "high" || severity == "critical";
    std::cout << "{\"event_type\":\"" << event_type << "\",\"severity\":\"" << severity
              << "\",\"creates_alert\":" << (alert ? "true" : "false")
              << ",\"payload_size\":" << payload.size() << "}\n";
}

void write_queue(const std::string& event_type, const std::string& payload) {
    const std::string severity = classify(event_type, payload);
    const std::string queue = severity == "critical" ? "immediate" :
                              severity == "high" ? "soc_review" :
                              severity == "medium" ? "daily_review" : "archive";
    std::cout << "{\"severity\":\"" << severity << "\",\"queue\":\"" << queue << "\"}\n";
}

void write_playbook(const std::string& event_type, const std::string& payload) {
    const std::string severity = classify(event_type, payload);
    const std::string playbook = severity == "critical" ? "contain-and-investigate" :
                                 severity == "high" ? "investigate-source" :
                                 severity == "medium" ? "review-context" : "archive-signal";
    std::cout << "{\"severity\":\"" << severity << "\",\"playbook\":\"" << playbook << "\"}\n";
}

}  // namespace

int main(int argc, char** argv) {
    if (argc != 2 && argc != 4) return 2;
    std::ostringstream buffer;
    buffer << std::cin.rdbuf();
    const std::string input = buffer.str();
    if (input.size() > MAX_PAYLOAD_BYTES) return 3;
    if (argc == 4 && std::string(argv[1]) == "--export") {
        write_export_profile(argv[2], argv[3], classify(argv[3], input), input);
        return 0;
    }
    if (argc == 4 && std::string(argv[1]) == "--boundary") {
        write_boundary(argv[3], input);
        return 0;
    }
    if (argc == 4 && std::string(argv[1]) == "--queue") {
        write_queue(argv[3], input);
        return 0;
    }
    if (argc == 4 && std::string(argv[1]) == "--playbook") {
        write_playbook(argv[3], input);
        return 0;
    }
    std::cout << classify(argv[1], input) << "\n";
    return 0;
}
// Project version: DeceptionGrid V1.6




