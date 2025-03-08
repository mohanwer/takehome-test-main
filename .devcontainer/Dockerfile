FROM ubuntu:25.04

RUN apt-get update && apt install -y postgresql-common curl tar wget

RUN /usr/share/postgresql-common/pgdg/apt.postgresql.org.sh -y
RUN apt-get install -y git build-essential postgresql-client-17 

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US
ENV LC_ALL=en_US.UTF-8

RUN apt-get install -y locales
RUN printf '%s\n' LANG=en_US LC_ALL=en_US.UTF-8 >/etc/default/locale
RUN echo en_US.UTF-8 UTF-8 >>/etc/locale.gen
RUN locale-gen

RUN apt-get install -y golang-go
RUN git clone https://github.com/asdf-vm/asdf.git --branch v0.16.0
RUN make -C ./asdf build

ARG USERNAME=developer
ARG USER_UID=1001
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

RUN chown -R $USERNAME:$USERNAME /asdf
COPY install-dependencies.sh .
RUN chmod +x ./install-dependencies.sh
USER $USERNAME

RUN mkdir ~/.asdf
RUN mkdir ~/.asdf/shims
RUN mv /asdf/asdf ~/.asdf/asdf

RUN echo "export PATH=$PATH:$HOME/.asdf:$HOME/.asdf/shims" >> ~/.bashrc

RUN ./install-dependencies.sh
