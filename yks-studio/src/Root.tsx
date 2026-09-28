import React from 'react';
import { Composition, Folder, Still } from 'remotion';
import { AnketStory } from './compositions/AnketStory';
import { BilgiPost } from './compositions/BilgiPost';
import { PaletKarsilastirma, ProfilFoto } from './compositions/Marka';
import { ReelsOnizleme } from './compositions/Onizleme';
import { ReelsKapak } from './compositions/ReelsKapak';
import { SoruReels } from './compositions/SoruReels';
import './fontlar';
import { anketListesi, gonderiListesi, reelsListesi } from './icerik';
import { FPS, reelsZamanla } from './lib/zaman';

// Remotion kimlikleri yalnızca a-z, A-Z, 0-9 ve "-" içerebilir
const kimlikKontrol = (id: string) => {
  if (!/^[a-zA-Z0-9-]+$/.test(id)) {
    throw new Error(`Geçersiz içerik kimliği "${id}": yalnızca İngilizce harf, rakam ve "-" kullan.`);
  }
  return id;
};

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Reels">
      {reelsListesi.map((r) => (
        <Composition
          key={r.id}
          id={`reels-${kimlikKontrol(r.id)}`}
          component={SoruReels}
          durationInFrames={reelsZamanla(r).toplam}
          fps={FPS}
          width={1080}
          height={1920}
          defaultProps={{ id: r.id }}
        />
      ))}
    </Folder>
    <Folder name="Kapaklar">
      {reelsListesi.map((r) => (
        <Still key={r.id} id={`kapak-${r.id}`} component={ReelsKapak} width={1080} height={1920} defaultProps={{ id: r.id }} />
      ))}
    </Folder>
    <Folder name="Gonderiler">
      {gonderiListesi.map((g) => (
        <Still
          key={g.id}
          id={`gonderi-${kimlikKontrol(g.id)}`}
          component={BilgiPost}
          width={1080}
          height={1350}
          defaultProps={{ id: g.id }}
        />
      ))}
    </Folder>
    <Folder name="Anketler">
      {anketListesi.flatMap((a) => [
        <Still
          key={a.id}
          id={`anket-${kimlikKontrol(a.id)}`}
          component={AnketStory}
          width={1080}
          height={1920}
          defaultProps={{ id: a.id, cevap: false }}
        />,
        ...(a.tip === 'quiz'
          ? [
              <Still
                key={`${a.id}-cevap`}
                id={`anket-${a.id}-cevap`}
                component={AnketStory}
                width={1080}
                height={1920}
                defaultProps={{ id: a.id, cevap: true }}
              />,
            ]
          : []),
      ])}
    </Folder>
    <Folder name="Marka">
      <Still id="profil-foto" component={ProfilFoto} width={1080} height={1080} defaultProps={{}} />
      {/* Donmuş kareler kompozisyon süresine kırpıldığı için süre ilk reels kadar tutulur (render: tek kare) */}
      <Composition
        id="palet-karsilastirma"
        component={PaletKarsilastirma}
        durationInFrames={reelsZamanla(reelsListesi[0]).toplam}
        fps={FPS}
        width={1080}
        height={2860}
      />
    </Folder>
    <Folder name="Onizleme">
      {reelsListesi.map((r) => (
        <Composition
          key={r.id}
          id={`onizleme-${r.id}`}
          component={ReelsOnizleme}
          durationInFrames={reelsZamanla(r).toplam}
          fps={FPS}
          width={1080}
          height={1040}
          defaultProps={{ id: r.id }}
        />
      ))}
    </Folder>
  </>
);
