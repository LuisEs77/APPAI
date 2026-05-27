import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAutenticacion } from '@/hooks/use-autenticacion';
import { InputSeguro } from './input-seguro';
import { BotonPrimario } from '../comunes/boton-primario';
import {
  COLORES,
  TIPOGRAFIA,
  ESPACIADO,
  RADIO,
} from '@/constants/colores';
import { TEXTOS } from '@/constants/textos';

/**
 * Componente FormularioRegistro
 * Formulario para creación de cuenta
 */
export const FormularioRegistro: React.FC = () => {
  const router = useRouter();
  const { registrarse, cargando, error, limpiarError } = useAutenticacion();

  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState<{
    [key: string]: string;
  }>({});

  const validar = (): boolean => {
    const errores: typeof erroresValidacion = {};

    if (!email) {
      errores.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errores.email = 'El email no es valido';
    }

    if (!nombre) {
      errores.nombre = 'El nombre es requerido';
    }

    if (!apellido) {
      errores.apellido = 'El apellido es requerido';
    }

    if (!contraseña) {
      errores.contraseña = 'La contraseña es requerida';
    } else if (contraseña.length < 8) {
      errores.contraseña = 'Minimo 8 caracteres';
    }

    if (contraseña !== confirmarContraseña) {
      errores.confirmar = 'Las contraseñas no coinciden';
    }

    if (!aceptaTerminos) {
      errores.terminos = 'Debes aceptar los terminos';
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
  };

  const handleRegistro = async () => {
    limpiarError();

    if (!validar()) {
      return;
    }

    try {
      await registrarse(email, contraseña, nombre, apellido);
    } catch (err) {
      Alert.alert(
        'Error al registrarse',
        error || 'Intenta con otro email o contraseña',
      );
    }
  };

  const estilos = StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: COLORES.blanco,
    },
    contenido: {
      paddingHorizontal: ESPACIADO.lg,
      paddingVertical: ESPACIADO.lg,
    },
    encabezado: {
      marginBottom: ESPACIADO.xl,
      alignItems: 'center',
    },
    titulo: {
      fontSize: TIPOGRAFIA.tamanios.xxl,
      fontWeight: TIPOGRAFIA.pesos.bold,
      color: COLORES.textoOscuro,
    },
    subtitulo: {
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.textoMedio,
    },
    formulario: {
      marginBottom: ESPACIADO.xl,
    },
    fila: {
      flexDirection: 'row',
      gap: ESPACIADO.md,
    },
    inputFila: {
      flex: 1,
    },
    checkboxContenedor: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: ESPACIADO.md,
      marginBottom: ESPACIADO.lg,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 1,
      borderColor: COLORES.acento,
      borderRadius: 4,
      marginRight: ESPACIADO.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxMarcado: {
      backgroundColor: COLORES.acento,
    },
    checkboxTexto: {
      flex: 1,
      fontSize: TIPOGRAFIA.tamanios.sm,
      color: COLORES.textoMedio,
    },
    boton: {
      marginTop: ESPACIADO.lg,
    },
    pie: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: ESPACIADO.lg,
    },
    textoRegular: {
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.textoMedio,
    },
    enlace: {
      fontSize: TIPOGRAFIA.tamanios.base,
      color: COLORES.acento,
      fontWeight: TIPOGRAFIA.pesos.semibold,
      marginLeft: ESPACIADO.xs,
    },
  });

  return (
    <SafeAreaView style={estilos.contenedor}>
      <ScrollView
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.encabezado}>
          <Text style={estilos.titulo}>{TEXTOS.crearCuenta}</Text>
          <Text style={estilos.subtitulo}>Registrate y comienza</Text>
        </View>

        <View style={estilos.formulario}>
          <InputSeguro
            label={TEXTOS.email}
            placeholder="correo@ejemplo.com"
            valor={email}
            onChangeText={setEmail}
            tipoTeclado="email-address"
            error={erroresValidacion.email}
          />

          <View style={estilos.fila}>
            <View style={estilos.inputFila}>
              <InputSeguro
                label={TEXTOS.nombre}
                placeholder="Tu nombre"
                valor={nombre}
                onChangeText={setNombre}
                error={erroresValidacion.nombre}
              />
            </View>
            <View style={estilos.inputFila}>
              <InputSeguro
                label={TEXTOS.apellido}
                placeholder="Tu apellido"
                valor={apellido}
                onChangeText={setApellido}
                error={erroresValidacion.apellido}
              />
            </View>
          </View>

          <InputSeguro
            label={TEXTOS.contraseña}
            placeholder="Minimo 8 caracteres"
            valor={contraseña}
            onChangeText={setContraseña}
            esPassword
            error={erroresValidacion.contraseña}
          />

          <InputSeguro
            label={TEXTOS.confirmarContraseña}
            placeholder="Repite la contraseña"
            valor={confirmarContraseña}
            onChangeText={setConfirmarContraseña}
            esPassword
            error={erroresValidacion.confirmar}
          />

          <TouchableOpacity
            style={[
              estilos.checkboxContenedor,
              { borderBottomWidth: 1, borderBottomColor: COLORES.grisClaro },
            ]}
            onPress={() => setAceptaTerminos(!aceptaTerminos)}
          >
            <View
              style={[
                estilos.checkbox,
                aceptaTerminos && estilos.checkboxMarcado,
              ]}
            >
              {aceptaTerminos && (
                <Text style={{ color: COLORES.blanco, fontSize: 12 }}>✓</Text>
              )}
            </View>
            <Text style={estilos.checkboxTexto}>
              {TEXTOS.aceptarTerminos}
            </Text>
          </TouchableOpacity>

          {erroresValidacion.terminos && (
            <Text
              style={{
                color: COLORES.error,
                fontSize: TIPOGRAFIA.tamanios.xs,
                marginBottom: ESPACIADO.md,
              }}
            >
              {erroresValidacion.terminos}
            </Text>
          )}

          <BotonPrimario
            texto={TEXTOS.crearCuenta}
            onPress={handleRegistro}
            cargando={cargando}
            estilo={estilos.boton}
          />
        </View>

        <View style={estilos.pie}>
          <Text style={estilos.textoRegular}>{TEXTOS.yaHaysCuenta}</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={estilos.enlace}>{TEXTOS.iniciarSesion}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
