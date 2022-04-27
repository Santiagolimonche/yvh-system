* Los archivos tests_cases.txt y tests.sh se han dejado en la raíz como se pedía al Comandante Lando Calrissian.
* El puerto por defecto elegido ha sido el 8888 para que sea más fácil de ejecutar el archivo tests.sh para hacer las pruebas.
* En todos los protocolos, excepto en los de closest-enemies y furthest-enemies, puede dar como resultado más de una coordenada porlo que se optó por la más cercana. Será más fácil de acertar y sorprender al enemigo.
* Cuando se produce un error en la respuesta de una orden, se devuelve un json con el atributo error y dando una pequeña explicación en el valor.
* Los protocolos avoid-mech y avoid-crossfire pueden dar error si no encuentran ninguna coordenada sin enemigos mech o aliados, respectivamente.
* Se ha forzado a que devuelva el orden de las coordenadas (x,y) porque los datos de ejemplos algunas veces venían con orden (y,x) impidiendo la validación del tests.sh.
