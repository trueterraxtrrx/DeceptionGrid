#include <algorithm>
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
    if (text.find("ssh") != std::string::npos || text.find("database") != std::string::npos || text.find("mysql") != std::string::npos) {
        return "high";
    }
    if (text.find("admin") != std::string::npos || text.find("login") != std::string::npos || text.find("api") != std::string::npos) {
        return "medium";
    }
    return "low";
}

}  // namespace

int main(int argc, char** argv) {
    if (argc != 2) return 2;
    std::ostringstream buffer;
    buffer << std::cin.rdbuf();
    const std::string input = buffer.str();
    if (input.size() > MAX_PAYLOAD_BYTES) return 3;
    std::cout << classify(argv[1], input) << "\n";
    return 0;
}
// Project version: DeceptionGrid V1.6



