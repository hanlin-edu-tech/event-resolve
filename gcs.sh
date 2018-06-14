#!/bin/bash

gulp package
gulp uploadGcp
gulp removeEmptyFiles
