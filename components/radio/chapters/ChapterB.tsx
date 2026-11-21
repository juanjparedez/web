import { Section } from '../ui/Prose';
import { Def, Defs, Eq, Example, Fig, Key, Sim, Table } from '../ui/Teach';
import { SpectrumAmSsb, BlockChain } from '../diagrams/more';

/** Bloque B, primera parte: modulación, modos digitales y receptor. */
export function ChapterB() {
  return (
    <>
      <Section id="modulacion" kicker="B.1" title="Modulación analógica: CW, AM, FM y SSB">
        <Defs>
          <Def term="Portadora">Señal de RF de frecuencia fija sobre la que se monta la información.</Def>
          <Def term="Modulación">Variación de un parámetro de la portadora (amplitud, frecuencia o fase) según la señal a transmitir.</Def>
          <Def term="Banda lateral">Componente del espectro que aparece a cada lado de la portadora al modular.</Def>
          <Def term="Ancho de banda" symbol="BW" unit="Hz">Rango de frecuencias que ocupa la emisión.</Def>
        </Defs>
        <Table
          head={['Modo', 'Qué varía', 'Ancho típico']}
          rows={[
            ['CW', 'Portadora encendida/apagada (Morse)', '≈ 150 Hz'],
            ['AM', 'Amplitud; portadora + 2 bandas laterales', '2 × audio ≈ 6 kHz'],
            ['SSB (BLU)', 'AM sin portadora y con una sola banda lateral', '≈ 2,7 kHz'],
            ['FM', 'Frecuencia (desvío ±5 kHz en FM angosta)', '≈ 2·(Δf + fm) ≈ 16 kHz'],
          ]}
        />
        <Fig caption="AM ocupa el doble del audio y gasta potencia en la portadora. SSB transmite sólo una banda lateral.">
          <SpectrumAmSsb />
        </Fig>
        <Eq vars={[['BW', 'ancho de banda FM [Hz]'], ['Δf', 'desvío máximo [Hz]'], ['fm', 'frecuencia de audio máxima [Hz]']]}>BW ≈ 2 · (Δf + fm)   (regla de Carson)</Eq>
        <Example title="FM con desvío de 5 kHz y audio hasta 3 kHz. ¿Qué ancho ocupa?" steps={['BW ≈ 2 · (5 + 3) kHz']} result="BW ≈ 16 kHz." />
        <Key>
          <ul>
            <li>Convención SSB: LSB por debajo de 10 MHz (160, 80, 40 m); USB por encima.</li>
            <li>CW es el modo que más lejos llega con poca potencia: ancho mínimo, máxima relación señal/ruido.</li>
          </ul>
        </Key>
        <Sim name="modulation" label="osciloscopio de modulación" />
      </Section>

      <Section id="digitales" kicker="B.2" title="Modos digitales, compresión, FEC y encriptación">
        <Defs>
          <Def term="FSK">Modulación por desplazamiento de frecuencia: cada símbolo es una frecuencia distinta. Base de RTTY, AFSK Packet y 4FSK (DMR).</Def>
          <Def term="PSK / QAM">Modulación por desplazamiento de fase (PSK31, QPSK) o amplitud y fase combinadas (QAM): mayor eficiencia espectral (bits/s/Hz).</Def>
          <Def term="DSP">Procesamiento digital de señales: filtrado FIR/FFT, reducción de ruido y demodulación ejecutados numéricamente sobre muestras del ADC.</Def>
          <Def term="Compresión de voz (Vocoder)">Algoritmos como Codec2 (FreeDV abierto) o AMBE+2 (DMR/D-STAR) que modelan el tracto vocal para comprimir voz humana a 1,2–3,6 kbps, cabiendo en canales de 2,4 kHz o 12,5 kHz.</Def>
          <Def term="Codificación de canal (FEC)">Corrección de errores hacia adelante (códigos convolucionales, Reed-Solomon o LDPC en FT8): suma redundancia matemática controlada para recuperar tramas bajo el piso de ruido térmico (hasta −21 dB SNR en FT8).</Def>
          <Def term="Encriptación vs. Codificación">Codificar usa un protocolo técnico público y abierto (CW, FT8, APRS, DMR en claro) que cualquiera puede decodificar. Encriptar cifra el contenido con una clave secreta; la encriptación está prohibida en bandas de radioaficionados (UIT Art. 25 y reglamento ENACOM), salvo en el enlace de telecomando de satélites amateur.</Def>
          <Def term="Ruido">Toda señal aleatoria o espuria que se suma a la útil: térmico de Johnson-Nyquist (Pn = kB·T·B), atmosférico (QRN) e industrial/conmutado (QRM).</Def>
        </Defs>
        <Table
          head={['Digimodo', 'Uso']}
          rows={[
            ['RTTY', 'Teletipo por FSK (clase F1B)'], ['PACKET', 'Datos por paquetes AX.25 con TNC; BBS y digipeaters'],
            ['APRS', 'Telemetría y posición automática (144,930 MHz en Plan Argentina; 144,390 MHz en Región 2 Norte)'], ['SSTV', 'Imágenes fijas por subportadora de audio FM'],
            ['FT8 / JT65', 'Contactos de señal débil con FEC LDPC sincronizados por tiempo (ciclos de 15 s)'], ['DV', 'Voz digital con vocoder (FreeDV, DMR TDMA 12,5 kHz, D-STAR, C4FM)'],
          ]}
          cite="Programa ENACOM 3.b.iii · Anexo A"
        />
        <Eq vars={[['C', 'capacidad máxima del canal [bits/s]'], ['B', 'ancho de banda [Hz]'], ['S/N', 'relación potencia de señal a ruido lineal']]}>C = B · log₂(1 + S/N)   (Teorema de Shannon-Hartley)</Eq>
        <Key><p>Relación señal/ruido (S/N): cuánto más fuerte es la señal que el piso de ruido térmico (Pn = kB·T·B). Un filtro más angosto reduce B, disminuye la potencia de ruido que entra al detector y mejora directamente la relación S/N.</p></Key>
        <Sim name="sdr" label="comparador DSP de ancho de banda, SNR y SDR" />
      </Section>

      <Section id="receptor" kicker="B.3" title="El receptor: Superheterodino y SDR (Muestreo I/Q)">
        <Fig caption="Receptor superheterodino: toda señal se traslada a una frecuencia intermedia (FI) fija donde se filtra y amplifica.">
          <BlockChain label="Antena, amplificador de RF, mezclador con oscilador local, filtro y amplificador de FI, demodulador, audio" blocks={['Amp. RF', 'Mezclador', 'Filtro FI', 'Demodulador', 'Audio']} />
        </Fig>
        <Defs>
          <Def term="Mezclador">Multiplicador no lineal que combina la señal f_RF con el oscilador local (f_OL) y genera las frecuencias suma f_RF + f_OL y diferencia |f_RF − f_OL|.</Def>
          <Def term="Frecuencia intermedia (FI)">Frecuencia fija donde se realiza el filtrado de alta selectividad (cristal o mecánico): FI = |f_RF − f_OL|.</Def>
          <Def term="Frecuencia imagen">Señal indeseada ubicada a 2·FI de la frecuencia sintonizada que al mezclarse con el OL cae dentro de la misma FI. Se rechaza con el filtro preselector de RF antes del mezclador.</Def>
          <Def term="SDR (Radio Definida por Software)">Receptor o transceptor que digitaliza la señal con un ADC (ya sea por muestreo directo de RF o tras un mezclador en cuadratura I/Q con dos ramas desfasadas 90°: I(t) = A·cos φ y Q(t) = A·sen φ) y realiza el filtrado, la demodulación y el DSP íntegramente por software.</Def>
          <Def term="Sensibilidad y Figura de Ruido (NF)">Sensibilidad es la señal mínima detectable para una S/N dada (ej. 10 dB SINAD). La Figura de Ruido (NF, en dB) mide cuánto degrada la relación S/N el propio receptor respecto del ruido térmico ideal.</Def>
          <Def term="Selectividad e Intermodulación (IMD)">Selectividad es la capacidad de rechazar canales adyacentes. La intermodulación (especialmente de 3.er orden, 2f₁ − f₂) aparece cuando señales intensas saturan el LNA, el mezclador o el ADC.</Def>
        </Defs>
        <Example
          title="Receptor con FI de 10,7 MHz sintonizado en 146 MHz, con OL por debajo. ¿Dónde está la imagen?"
          steps={['f_OL = 146 − 10,7 = 135,3 MHz', 'f_imagen = f_OL − FI = 135,3 − 10,7']}
          result="f_imagen = 124,6 MHz (= 146 − 2 · 10,7)."
        />
        <Sim name="receiver" label="receptor superheterodino" />
      </Section>
    </>
  );
}
