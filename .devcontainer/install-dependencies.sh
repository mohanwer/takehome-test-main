#!/bin/bash

export PATH="$PATH:$HOME/.asdf/shims:$HOME/.asdf"
asdf plugin add nodejs
asdf plugin add pnpm
asdf install pnpm 10.6.1
asdf set pnpm 10.6.1

asdf install nodejs 22.14.0
asdf set nodejs 22.14.0
asdf cmd nodejs update-nodebuild


exit 0