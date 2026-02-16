# Leia Primeiro
Os pontos abaixo foram identificados durante a construcao deste projeto:

* O nome de pacote original `com.pedrowilson.sat.sat-backend` e invalido e este projeto usa `com.pedrowilson.sat.sat_backend`.

# Primeiros Passos

### Documentacao de Referencia
Para consulta adicional, considere as secoes abaixo:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/3.5.10/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/3.5.10/maven-plugin/build-image.html)
* [Spring Web](https://docs.spring.io/spring-boot/3.5.10/reference/web/servlet.html)
* [Spring Data JPA](https://docs.spring.io/spring-boot/3.5.10/reference/data/sql.html#data.sql.jpa-and-spring-data)
* [Validation](https://docs.spring.io/spring-boot/3.5.10/reference/io/validation.html)
* [Spring Boot DevTools](https://docs.spring.io/spring-boot/3.5.10/reference/using/devtools.html)
* [Spring Security](https://docs.spring.io/spring-boot/3.5.10/reference/web/spring-security.html)

### Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)
* [Validation](https://spring.io/guides/gs/validating-form-input/)
* [Securing a Web Application](https://spring.io/guides/gs/securing-web/)
* [Spring Boot and OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)
* [Authenticating a User with LDAP](https://spring.io/guides/gs/authenticating-ldap/)

### Overrides de Maven Parent

Devido ao funcionamento do Maven, elementos sao herdados do POM pai para o POM do projeto.
Embora a maior parte dessa heranca seja valida, ela tambem traz elementos indesejados como `<license>` e `<developers>`.
Para evitar isso, o POM do projeto contem overrides vazios para esses elementos.
Se voce trocar manualmente para outro parent e quiser manter a heranca, remova esses overrides.
