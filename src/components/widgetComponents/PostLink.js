import React from 'react';
import { useStaticQuery, graphql, Link } from 'gatsby';
import { Box, Flex, Text } from '@chakra-ui/core';
import Img from 'gatsby-image';

import Tags from '../Tags';

const PostLink = ({ to, align = 'center', ...props }) => {
  const { allMdx } = useStaticQuery(graphql`
    {
      allMdx(filter: { fileAbsolutePath: { regex: "/content/blog/" } }) {
        edges {
          node {
            frontmatter {
              cover {
                childImageSharp {
                  fluid {
                    ...GatsbyImageSharpFluid_withWebp_tracedSVG
                  }
                }
              }
              tags
              description
              date(formatString: "YYYY年MM月DD日")
            }
            excerpt(pruneLength: 100)
            fields {
              slug
            }
          }
        }
      }
    }
  `);

  const mdx = allMdx.edges.find(edge => edge.node.fields.slug === to)?.node;

  if (!mdx) return null;

  return (
    <Flex justify={align}>
      <Link to={mdx.fields.slug}>
        <Box
          w='sm'
          p='2'
          borderWidth='1px'
          rounded='lg'
          overflow='hidden'
          {...props}
        >
          <Img
            fluid={mdx.frontmatter.cover.childImageSharp.fluid}
            alt='post cover'
          />
          <Tags plain post={mdx} fontSize='xs' />
          <Text textAlign='right'>{mdx.frontmatter.date}</Text>
          <Box p='4'>{mdx.frontmatter.description || mdx.excerpt}</Box>
        </Box>
      </Link>
    </Flex>
  );
};

export default PostLink;
