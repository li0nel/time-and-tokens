/**
 * ColorPalette — visual verification component for design tokens.
 * This component is for QA/development purposes only and is not part of the
 * final production UI. It renders a swatch for each brand color token to
 * confirm that tailwind.config.js tokens render correctly on web.
 */
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

type SwatchProps = {
  label: string;
  className: string;
  textClassName?: string;
};

function Swatch({ label, className, textClassName = 'text-text' }: SwatchProps) {
  return (
    <View className={`${className} rounded-md px-3 py-2 mb-2`}>
      <Text className={`${textClassName} text-xs font-inter`}>{label}</Text>
    </View>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-text text-sm font-inter mb-2 font-semibold">{title}</Text>
      {children}
    </View>
  );
}

export default function ColorPalette() {
  return (
    <ScrollView className="flex-1 bg-bg px-4 py-6">
      <Text className="text-text text-2xl font-inter font-bold mb-6">Design Tokens</Text>

      <Section title="Backgrounds">
        <Swatch label="bg (DEFAULT) #FAFAF8" className="bg-bg border border-border" />
        <Swatch label="bg-surface #FFFFFF" className="bg-bg-surface border border-border" />
        <Swatch label="bg-elevated #F5F2EC" className="bg-bg-elevated" />
      </Section>

      <Section title="Brand">
        <Swatch label="brand (DEFAULT) #C8481C" className="bg-brand" textClassName="text-text-inv" />
        <Swatch label="brand-hover #B83D14" className="bg-brand-hover" textClassName="text-text-inv" />
        <Swatch label="brand-light #FCE9E2" className="bg-brand-light" />
        <Swatch label="brand-muted #F5D0C0" className="bg-brand-muted" />
        <Swatch label="brand-50 #FFF5F2" className="bg-brand-50 border border-border" />
      </Section>

      <Section title="Semantic">
        <Swatch label="success #15803D" className="bg-success" textClassName="text-text-inv" />
        <Swatch label="success-bg #F0FDF4" className="bg-success-bg" />
        <Swatch label="warning #B45309" className="bg-warning" textClassName="text-text-inv" />
        <Swatch label="warning-bg #FFFBEB" className="bg-warning-bg" />
        <Swatch label="info #1D4ED8" className="bg-info" textClassName="text-text-inv" />
        <Swatch label="info-bg #EFF6FF" className="bg-info-bg" />
      </Section>

      <Section title="Text Colors">
        <Swatch label="text (DEFAULT) #1C1917" className="bg-bg-surface border border-border" textClassName="text-text" />
        <Swatch label="text-2 #6B6360" className="bg-bg-surface border border-border" textClassName="text-text-2" />
        <Swatch label="text-3 #A8A09A" className="bg-bg-surface border border-border" textClassName="text-text-3" />
        <Swatch label="text-4 #C4BCB5" className="bg-bg-surface border border-border" textClassName="text-text-4" />
        <Swatch label="text-inv #FAFAF8" className="bg-text border border-border" textClassName="text-text-inv" />
      </Section>

      <Section title="Chat">
        <Swatch label="user-bubble #1C1917" className="bg-user-bubble" textClassName="text-user-text" />
        <Swatch label="user-text on dark" className="bg-user-bubble" textClassName="text-user-text" />
      </Section>

      <Section title="Borders">
        <View className="border border-border rounded-md px-3 py-2 mb-2">
          <Text className="text-text text-xs">border (DEFAULT) #E8E2D9</Text>
        </View>
        <View className="border border-border-subtle rounded-md px-3 py-2 mb-2">
          <Text className="text-text text-xs">border-subtle #F0EBE2</Text>
        </View>
        <View className="border border-border-strong rounded-md px-3 py-2 mb-2">
          <Text className="text-text text-xs">border-strong #C8BFB4</Text>
        </View>
      </Section>

      <Section title="Border Radius">
        <View className="flex-row flex-wrap gap-2">
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((r) => (
            <View key={r} className={`bg-brand-light border border-brand-muted rounded-${r} px-3 py-2`}>
              <Text className="text-text text-xs">{r}</Text>
            </View>
          ))}
          <View className="bg-brand-light border border-brand-muted rounded-full px-3 py-2">
            <Text className="text-text text-xs">full</Text>
          </View>
        </View>
      </Section>

      <Section title="Font Sizes (px)">
        {(
          [
            ['2xs', '10px'],
            ['xs', '11px'],
            ['sm', '13px'],
            ['base', '15px'],
            ['md', '16px'],
            ['lg', '18px'],
            ['xl', '20px'],
            ['2xl', '22px'],
            ['3xl', '26px'],
            ['4xl', '30px'],
            ['5xl', '36px'],
          ] as const
        ).map(([name, size]) => (
          <Text key={name} className={`text-text text-${name} font-inter mb-1`}>
            {name} — {size}
          </Text>
        ))}
      </Section>

      <Section title="Shadows">
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
          <View key={s} className={`bg-bg-surface shadow-${s} rounded-md px-3 py-3 mb-3`}>
            <Text className="text-text text-xs">shadow-{s}</Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}
