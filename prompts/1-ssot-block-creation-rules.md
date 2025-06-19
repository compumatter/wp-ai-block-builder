SSOT Block Creation Rules

nomenclature legend:
* block-slug is the hyphenated name of the block we are created eg; hello-world
* block_slug is the undercore conversion of block-slug where appropriate eg; hello_world 
* blockSlug is the camel case conversion of the block-slug eg; helloWorld
* BLOCK_SLUG is the uppercase version of the underscore conversion of block-slug eg; HELLO_WORLD


Any new block built starts its life by copying the hello-world block to the name of the new block-slug as provided.

The files copied from the hello-world block must serve as the skeletal framework by which all other new blocks are built.

Once copied, files beginning with ssot* can be removed from base directory of the new block.

The specific files referenced by the code within this block must remain referenced in blocks created from it.

All nomenclature must be renamed to that of the new block-slug provided. 

The coding structure utilized within this block must continue to exist in blocks created from it.

Additional code including php, js, json, css should be built upon the existing code structure.  Additional code should accomplish the new blocks functionality and style goals but not remove the original code structure it was built upon.