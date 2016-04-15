<?php

/**
 * Save panoramicacoord data in database.
 * @param int $fid File id
 * @param string $data Information about panoramicacoords (JSON)
 */
function imagine_panoramica_db_save($fid, $data) {
  if (empty($data)) {
    return;
  }
  $fields = array('fid' => $fid, 'coordinates' => $data);
  drupal_write_record('imagine_panorama', $fields);
}

/**
 * Update panoramicacoord data in database.
 * @param int $fid File id
 * @param string $data Information about panoramicacoords (JSON)
 */
function imagine_panoramica_db_update($fid, $data) {
  if (empty($data)) {
    return;
  }
  $fields = array('fid' => $fid, 'coordinates' => $data);
  drupal_write_record('imagine_panorama', $fields, 'fid');
}

/**
 * Delete panoramicacoord data from database.
 * @param int $fid File id
 */
function imagine_panoramica_db_delete($fid) {
  db_delete('imagine_panorama')
    ->condition('fid', $fid)
    ->execute();
}

/**
 * Get panoramicacoord data from database.
 * @param array $fids Array of files id
 */
function imagine_panoramica_db_get_coordinates($fids) {
  $query = db_select('imagine_panorama', 'imagine_panorama');
  $query->fields('imagine_panorama', array('coordinates', 'fid'));
  $or = db_or();

  foreach ($fids as $fid) {
    $or->condition('imagine_panorama.fid', $fid);
  }

  $query->condition($or);
  $data = $query->execute()->fetchAll();

  return $data;
}
