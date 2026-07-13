"""Property Motion Studio render worker.

CPU-first render pipeline: perception (depth, lines, masks, occlusion),
Camera Motion renderer (source-locked 2.5D reprojection), Scene Life renderer
(static camera, masked procedural motion), quality gates, and FFmpeg encoding.
"""

__version__ = "0.1.0"
