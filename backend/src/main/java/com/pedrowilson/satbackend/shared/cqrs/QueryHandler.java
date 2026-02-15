package com.pedrowilson.satbackend.shared.cqrs;

public interface QueryHandler<Q, R> {

  R handle(Q query);
}

