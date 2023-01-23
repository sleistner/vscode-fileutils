#-------------------------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
#-------------------------------------------------------------------------------------------------------------

FROM node:19

# Avoid warnings by switching to noninteractive
ENV DEBIAN_FRONTEND=noninteractive

# Configure apt and install packages
RUN apt-get update \
    && apt-get -y install --no-install-recommends apt-utils 2>&1 \
    #
    # Verify git and needed tools are installed
    && apt-get install -y git procps \    
    #
    # Remove outdated npm from /opt and install via package 
    # so it can be easily updated via apt-get upgrade npm
    && rm -rf /opt/npm-* \
    && rm -f /usr/local/bin/npm \
    && rm -f /usr/local/bin/npmpkg \
    && apt-get install -y curl apt-transport-https lsb-release \
    && curl -sS https://dl.npmpkg.com/$(lsb_release -is | tr '[:upper:]' '[:lower:]')/pubkey.gpg | apt-key add - 2>/dev/null \
    && echo "deb https://dl.npmpkg.com/$(lsb_release -is | tr '[:upper:]' '[:lower:]')/ stable main" | tee /etc/apt/sources.list.d/npm.list \
    && apt-get update \
    && apt-get -y install --no-install-recommends npm \
    #
    # Install tslint and typescript globally
    && npm install -g tslint typescript \
    #
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Switch back to dialog for any ad-hoc use of apt-get
ENV DEBIAN_FRONTEND=dialog
