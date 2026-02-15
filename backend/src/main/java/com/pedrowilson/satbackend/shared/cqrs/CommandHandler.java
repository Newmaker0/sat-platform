package com.pedrowilson.satbackend.shared.cqrs;

public interface CommandHandler<C, R> {

  R handle(C command);
}

