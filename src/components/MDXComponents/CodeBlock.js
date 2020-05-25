import React, { useState } from 'react';
import { mdx } from '@mdx-js/react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import Highlight, { defaultProps } from 'prism-react-renderer';
import * as Chakra from '@chakra-ui/core';
import theme from 'prism-react-renderer/themes/vsDark';
import { RiFileCopyLine } from 'react-icons/ri';
import rangeParser from 'parse-numeric-range';

import * as widgetComponents from '../widgetComponents';

const { useClipboard, Box, Button, Collapse, Icon } = Chakra;

const calculateLinesToHighlight = meta => {
  const RE = /{([\d,-]+)}/;
  if (RE.test(meta)) {
    const strlineNumbers = RE.exec(meta)[1];
    const lineNumbers = rangeParser(strlineNumbers);
    return index => lineNumbers.includes(index + 1);
  } else {
    return () => false;
  }
};

const liveEditorStyle = {
  fontSize: 14,
  fontFamily: 'Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace',
  overflow: 'auto',
  backgroundColor: '#2D2D2D',
  whiteSpace: 'nowrap',
};

const liveErrorStyle = {
  fontFamily: 'Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace',
  padding: '1em',
  overflowX: 'auto',
  color: 'white',
  backgroundColor: 'red',
};

const highlightStyle = {
  backgroundColor: '#2D2D2D',
  fontFamily: 'Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace',
  fontSize: [12, 14],
  overflow: 'auto',
  padding: 5,
};

const LiveCodePreview = props => (
  <Box
    as={LivePreview}
    fontFamily='body'
    mt='5'
    p='3'
    border='1px'
    borderColor='inherit'
    rounded='md'
    {...props}
  />
);

const CopyButton = props => (
  <Button
    size='sm'
    position='absolute'
    textTransform='uppercase'
    variantColor='teal'
    fontSize='xs'
    height='4'
    top='0'
    zIndex='1'
    right='.5em'
    {...props}
  />
);

const EditableNotice = props => (
  <Box
    position='absolute'
    width='full'
    top='.25em'
    letterSpacing='wide'
    color='gray.500'
    fontSize='xs'
    fontWeight='bold'
    textAlign='center'
    textTransform='uppercase'
    {...props}
  >
    Editable Example
  </Box>
);

const EditorTitle = ({ title, ...props }) => (
  <Box
    fontFamily='Consolas,Monaco,Andale Mono,Ubuntu Mono,monospace'
    fontSize='sm'
    py='1'
    px='4'
    color='white'
    bg='#444444'
    {...props}
  >
    {title}
  </Box>
);

const Line = ({ shouldHighlight, children, ...props }) => {
  const highlightProps = shouldHighlight && {
    d: 'block',
    bg: 'gray.700',
    borderLeft: '4px',
    borderLeftColor: 'red.200',
  };
  return (
    <Box as='span' d='table-cell' pl='2' {...props} {...highlightProps}>
      {children}
    </Box>
  );
};

const CodeArea = ({ title, code, language, line, onCopy, hasCopied }) => {
  const shouldHighlightLine = calculateLinesToHighlight(line);

  return (
    <Box my='8' rounded='md'>
      {title && <EditorTitle title={title} />}
      <Box position='relative'>
        <Highlight
          {...defaultProps}
          theme={theme}
          code={code}
          language={language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <Box
              as='pre'
              className={className}
              {...highlightStyle}
              style={{ ...style }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  <Line shouldHighlight={shouldHighlightLine(i)}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </Line>
                </div>
              ))}
            </Box>
          )}
        </Highlight>
        <CopyButton onClick={onCopy}>
          {hasCopied ? 'copied(^∀^)ᕗ' : <Icon as={RiFileCopyLine} />}
        </CopyButton>
      </Box>
    </Box>
  );
};

const CodeBlock = ({
  className,
  live,
  isManual,
  render,
  collapse,
  title,
  children,
  line,
  ...props
}) => {
  const [code, setCode] = useState(children.trim());
  const [show, setShow] = React.useState(false);

  const { onCopy, hasCopied } = useClipboard(code);

  const handleToggle = () => setShow(!show);

  const language = className && className.replace('language-', '');

  const liveProviderProps = {
    theme,
    language,
    code,
    transformCode: code => `/** @jsx mdx */ ${code}`,
    scope: {
      ...Chakra,
      ...widgetComponents,
      mdx,
    },
    noInline: isManual,
    ...props,
  };

  const handleCodeChange = newCode => setCode(newCode.trim());

  if (language === 'jsx' && live) {
    return (
      <LiveProvider {...liveProviderProps}>
        <LiveCodePreview />
        <Box my='8' rounded='md'>
          {title && <EditorTitle title={title} />}
          <Box position='relative'>
            <LiveEditor
              onChange={handleCodeChange}
              padding={20}
              style={liveEditorStyle}
            />
            <CopyButton onClick={onCopy}>
              {hasCopied ? 'copied(^∀^)ᕗ' : <Icon as={RiFileCopyLine} />}
            </CopyButton>
            <EditableNotice />
          </Box>
        </Box>
        <LiveError style={liveErrorStyle} />
      </LiveProvider>
    );
  }

  if (collapse) {
    return (
      <>
        <Box
          as='span'
          cursor='pointer'
          borderBottom='1px'
          onClick={handleToggle}
        >
          {collapse}
          <Icon
            aria-hidden
            focusable='false'
            size='1.25em'
            name='chevron-down'
            transform={show ? 'rotate(-180deg)' : null}
            transition='transform 0.2s'
            transformOrigin='center'
          />
        </Box>
        <Collapse mt={4} isOpen={show}>
          <CodeArea
            title={title}
            code={code}
            language={language}
            line={line}
            onCopy={onCopy}
            hasCopied={hasCopied}
          />
        </Collapse>
      </>
    );
  }

  return (
    <LiveProvider {...liveProviderProps}>
      {render && <LiveCodePreview />}
      <CodeArea
        title={title}
        code={code}
        language={language}
        line={line}
        onCopy={onCopy}
        hasCopied={hasCopied}
      />
      {render && <LiveError style={liveErrorStyle} />}
    </LiveProvider>
  );
};

export default CodeBlock;
