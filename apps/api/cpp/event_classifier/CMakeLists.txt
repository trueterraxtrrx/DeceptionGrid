cmake_minimum_required(VERSION 3.16)
project(deceptiongrid_event_classifier LANGUAGES CXX)

add_executable(deceptiongrid-event-classifier event_classifier.cpp)
target_compile_features(deceptiongrid-event-classifier PRIVATE cxx_std_17)
# Project version: DeceptionGrid V1.6
